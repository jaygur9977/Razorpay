const getGroqConfig = () => ({
  url: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1/chat/completions',
  model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
  timeoutMs: Number(process.env.GROQ_TIMEOUT_MS || 30000),
});

const allowedActions = ['auto_retry', 'whatsapp_reminder', 'email_followup', 'voice_call', 'smart_discount', 'stop_recovery'];
const allowedCategories = ['temporary_infrastructure', 'customer_financial', 'authentication_failure', 'user_abandonment', 'external_infrastructure', 'connectivity_issue', 'organizational', 'unknown'];
const allowedStatuses = ['recovered', 'in_progress', 'stopped', 'escalated'];
const allowedUrgencies = ['immediate', 'high', 'medium', 'low'];
let nextRequestAt = 0;
let requestChain = Promise.resolve();

const schemas = {
  detection: '{"isAtRisk":true,"riskLevel":"critical|high|medium|low","isRecoverable":true,"immediateAction":"create_case|ignore|review","reasoning":"string"}',
  diagnosis: '{"rootCause":"string","category":"allowed category","confidence":0,"recoveryProbability":0,"customerSentiment":"neutral|hesitant|concerned|frustrated","recommendedActions":["allowed action"],"diagnosis":"string"}',
  priority: '{"priority":"CRITICAL|HIGH|MEDIUM|LOW","queuePosition":1,"reasoning":"string"}',
  decision: '{"selectedAction":"allowed action","fallbackAction":"allowed action or null","expectedNetRecovery":0,"reasoning":"string","shouldOfferDiscount":false,"stoppingCondition":"string"}',
  escalation: '{"shouldEscalate":true,"escalateTo":"ops_manager|admin|merchant","urgency":"immediate|high|medium|low","summary":"string","recommendedAction":"allowed action","riskIfDelayed":"string","approvalRequired":true}',
  execution: '{"subject":"string","message":"string","tone":"professional|friendly|urgent","callToAction":"string"}',
  monitor: '{"caseStatus":"recovered|in_progress|stopped|escalated","shouldRetry":false,"nextAction":"allowed action or null","shouldStop":false,"stopReason":"string or null","shouldEscalate":false,"reasoning":"string"}',
  audit: '{"compliant":true,"violations":[],"recommendations":[],"auditSummary":"string"}',
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const percent = (value) => {
  const numericValue = Number(value) || 0;
  return numericValue > 0 && numericValue <= 1 ? numericValue * 100 : numericValue;
};
const parseJson = (content) => JSON.parse(String(content).replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim());
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const waitForRequestSlot = async () => {
  requestChain = requestChain.then(async () => {
    const delay = Math.max(0, nextRequestAt - Date.now());
    if (delay) await wait(delay);
    nextRequestAt = Date.now() + Number(process.env.GROQ_MIN_REQUEST_INTERVAL_MS || 1200);
  });
  await requestChain;
};

const getLocalAgentResult = (agent, context) => {
  const amount = Number(context.amount) || 0;
  const probability = context.recoveryProbability || (context.customerType === 'vip' ? 75 : 60);
  const localResults = {
    detection: { isAtRisk: true, riskLevel: amount >= 50000 ? 'critical' : amount >= 10000 ? 'high' : 'medium', isRecoverable: true, immediateAction: 'create_case', reasoning: 'Local recovery rules used while the AI provider is rate limited.' },
    diagnosis: { rootCause: 'Temporary payment or connectivity issue', category: 'connectivity_issue', confidence: 60, recoveryProbability: probability, customerSentiment: 'concerned', recommendedActions: ['auto_retry', 'whatsapp_reminder'], diagnosis: 'The transaction is eligible for a low-cost retry.' },
    priority: { priority: amount >= 50000 ? 'CRITICAL' : amount >= 10000 ? 'HIGH' : 'MEDIUM', queuePosition: 1, reasoning: 'Prioritized by amount and recoverability.' },
    decision: { selectedAction: 'auto_retry', fallbackAction: 'whatsapp_reminder', expectedNetRecovery: Math.round(amount * probability / 100), reasoning: 'Auto Retry has no action cost and is the most economical first step.', shouldOfferDiscount: false, stoppingCondition: 'Stop after max attempts.' },
    escalation: { shouldEscalate: false, escalateTo: 'ops_manager', urgency: 'medium', summary: 'No escalation required by local recovery policy.', recommendedAction: 'auto_retry', riskIfDelayed: 'Recovery may become less likely over time.', approvalRequired: false },
    execution: { subject: 'Payment recovery retry', message: 'A recovery retry was initiated.', tone: 'professional', callToAction: 'Complete the payment if prompted.' },
    monitor: { caseStatus: context.currentStatus === 'recovered' ? 'recovered' : 'in_progress', shouldRetry: false, nextAction: null, shouldStop: false, stopReason: null, shouldEscalate: false, reasoning: 'Workflow monitored using local fallback rules.' },
    audit: { compliant: true, violations: [], recommendations: [], auditSummary: 'Workflow completed with provider fallback protection.' },
  };
  return validate(agent, localResults[agent]);
};

const validate = (agent, result) => {
  if (!result || typeof result !== 'object') throw new Error(`${agent} agent returned an invalid object`);
  if (agent === 'detection') {
    if (!['critical', 'high', 'medium', 'low'].includes(result.riskLevel)) throw new Error('Invalid detection risk level');
    return { isAtRisk: Boolean(result.isAtRisk), riskLevel: result.riskLevel, isRecoverable: Boolean(result.isRecoverable), immediateAction: String(result.immediateAction || 'review'), reasoning: String(result.reasoning || '') };
  }
  if (agent === 'diagnosis') {
    return { rootCause: String(result.rootCause || 'Unknown issue'), category: allowedCategories.includes(result.category) ? result.category : 'unknown', confidence: clamp(percent(result.confidence), 0, 100), sentiment: ['neutral', 'hesitant', 'concerned', 'frustrated'].includes(result.customerSentiment) ? result.customerSentiment : 'neutral', recoveryProbability: clamp(percent(result.recoveryProbability), 0, 100), recommendedActions: Array.isArray(result.recommendedActions) ? result.recommendedActions.filter((action) => allowedActions.includes(action)) : [], diagnosis: String(result.diagnosis || '') };
  }
  if (agent === 'priority') {
    if (!['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(result.priority)) throw new Error('Invalid priority');
    return { priority: result.priority, queuePosition: Math.max(1, Math.round(Number(result.queuePosition) || 1)), reasoning: String(result.reasoning || '') };
  }
  if (agent === 'decision') {
    if (!allowedActions.includes(result.selectedAction)) throw new Error('Invalid selected action');
    const fallbackAction = result.fallbackAction && allowedActions.includes(result.fallbackAction) ? result.fallbackAction : null;
    return { selectedAction: result.selectedAction, fallbackAction, expectedNetRecovery: Number(result.expectedNetRecovery) || 0, reasoning: String(result.reasoning || ''), shouldOfferDiscount: Boolean(result.shouldOfferDiscount), stoppingCondition: String(result.stoppingCondition || '') };
  }
  if (agent === 'monitor') {
    if (!allowedStatuses.includes(result.caseStatus)) throw new Error('Invalid monitor status');
    return { caseStatus: result.caseStatus, shouldRetry: Boolean(result.shouldRetry), nextAction: result.nextAction && allowedActions.includes(result.nextAction) ? result.nextAction : null, shouldStop: Boolean(result.shouldStop), stopReason: result.stopReason ? String(result.stopReason) : null, shouldEscalate: Boolean(result.shouldEscalate), reasoning: String(result.reasoning || '') };
  }
  if (agent === 'escalation') {
    if (!['ops_manager', 'admin', 'merchant'].includes(result.escalateTo) || !allowedUrgencies.includes(result.urgency)) throw new Error('Invalid escalation result');
    return { shouldEscalate: Boolean(result.shouldEscalate), escalateTo: result.escalateTo, urgency: result.urgency, summary: String(result.summary || ''), recommendedAction: allowedActions.includes(result.recommendedAction) ? result.recommendedAction : 'stop_recovery', riskIfDelayed: String(result.riskIfDelayed || ''), approvalRequired: Boolean(result.approvalRequired) };
  }
  if (agent === 'execution') {
    if (!['professional', 'friendly', 'urgent'].includes(result.tone)) throw new Error('Invalid execution tone');
    return { subject: String(result.subject || ''), message: String(result.message || ''), tone: result.tone, callToAction: String(result.callToAction || '') };
  }
  if (agent === 'audit') {
    return { compliant: Boolean(result.compliant), violations: Array.isArray(result.violations) ? result.violations.map(String) : [], recommendations: Array.isArray(result.recommendations) ? result.recommendations.map(String) : [], auditSummary: String(result.auditSummary || '') };
  }
  throw new Error(`Unsupported agent: ${agent}`);
};

export const runGroqAgent = async (agent, context) => {
  if (!process.env.GROQ_API_KEY || process.env.GROQ_LOCAL_FALLBACK === 'true') return getLocalAgentResult(agent, context);
  const config = getGroqConfig();
  try {
    let response;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await waitForRequestSlot();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
      response = await fetch(config.url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.model,
        temperature: 0.1,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: `You are the ${agent} Agent in a revenue recovery workflow. Reason from the supplied data. Return only valid JSON matching this exact shape: ${schemas[agent]}. Never invent missing facts. Never return code, URLs, database commands, or payment-provider commands.` },
          { role: 'user', content: JSON.stringify({ agent, context }) },
        ],
      }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (response.status !== 429 || attempt === 2) break;
      const retryAfter = Math.min(Number(response.headers.get('retry-after')) || (2 ** attempt), 10);
      nextRequestAt = Math.max(nextRequestAt, Date.now() + retryAfter * 1000);
    }
    if (!response.ok) throw new Error(`Groq request failed with HTTP ${response.status}`);
    const payload = await response.json();
    const content = payload.choices?.[0]?.message?.content;
    if (!content) throw new Error('Groq returned no agent content');
    return validate(agent, parseJson(content));
  } catch (error) {
    if (error.name === 'AbortError') throw new Error(`Groq ${agent} agent timed out`);
    if (error.message.includes('HTTP 429') || error.message.includes('timed out') || error.message.includes('fetch failed')) {
      console.warn(`Groq ${agent} unavailable; using local recovery fallback.`);
      return getLocalAgentResult(agent, context);
    }
    throw error;
  }
};
