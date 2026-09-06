# RevArb AI  Revenue Recovery System




What is RevArb AI?
RevArb AI is an intelligent, AIpowered revenue recovery platform designed to help businesses recover failed payments and abandoned transactions automatically. The system uses advanced machine learning agents to analyze payment failures, determine the best recovery strategy, and execute targeted interventions to maximize revenue recovery.

Why Was This Project Built?
 Revenue Loss: Businesses lose 2030% of revenue due to payment failures, abandoned checkouts, and overdue invoices
 Manual Recovery: Traditional recovery methods are laborintensive, inconsistent, and expensive
 Customer Experience: Aggressive recovery tactics damage customer relationships
 Data Overload: Businesses struggle to prioritize which failed payments to recover first
 Cost Efficiency: Manual recovery costs often exceed the recovered amount




8 Intelligent Agents Working in Sequence

1. Detection Agent
 Purpose: Identifies revenue at risk from transaction data
 Color: Cyan (#06b6d4)
 Icon: Search
 How It Works: Analyzes transaction status, amounts, and patterns to detect recoverable revenue
 Output: Risk level (critical/high/medium/low), recoverability assessment, immediate action recommendation

2. Diagnosis Agent 
 Purpose: Analyzes root cause of payment failures using Groq LLM
 Color: Purple (#8b5cf6)
 Icon: Stethoscope
 How It Works: Uses AI to determine why payment failed (technical, customer, infrastructure issues)
 Output: Root cause, category, confidence score, recovery probability, customer sentiment
 Categories: temporary_infrastructure, customer_financial, authentication_failure, user_abandonment, external_infrastructure, connectivity_issue, organizational, unknown

3. Priority Agent
 Purpose: Calculates Expected Net Recovery Value (ENRV) and queue position
 Color: Amber (#f59e0b)
 Icon: Target
 How It Works: Computes ROI considering amount, recovery probability, and action costs
 Formula: ENRV = Amount × (Recovery Probability ÷ 100)  Action Cost
 Output: Priority level (CRITICAL/HIGH/MEDIUM/LOW), queue position, reasoning

4. Decision Agent
 Purpose: Selects optimal recovery action using AI decisionmaking
 Color: Pink (#ec4899)
 Icon: Zap
 How It Works: Evaluates all available actions against cost, success rate, and customer context
 Available Actions: 
   Auto Retry (Free, 85% success)
   WhatsApp Reminder (₹10, 65% success)
   Email Followup (₹5, 45% success)
   Voice Call (₹100, 72% success)
   Smart Discount (₹500, 90% success)
   Stop Recovery (Free, 0% success)
 Output: Selected action, fallback action, expected recovery, reasoning

5. Escalation Agent
 Purpose: Manages human approval workflow for highvalue or complex cases
 Color: Red (#ef4444)
 Icon: Shield
 How It Works: Identifies cases requiring human intervention and routes to appropriate roles
 Escalation Triggers: 
   Amount ≥ ₹10,000
   CRITICAL priority
   Promisetopay cases with 2+ failed attempts
 Output: Escalation recommendation, urgency level, target role (ops_manager/admin/merchant)

6. Execution Agent
 Purpose: Performs the selected recovery actions
 Color: Green (#10b981)
 Icon: Bot
 How It Works: Executes the chosen intervention (currently simulated, ready for real integrations)
 Future Integrations: Real payment gateways, WhatsApp Business API, email services, voice calling
 Output: Execution status, result, amount recovered, time taken

7. Monitor Agent
 Purpose: Tracks response and evaluates final recovery state
 Color: Purple (#a855f7)
 Icon: Eye
 How It Works: Monitors execution results and determines next steps (retry/stop/escalate)
 Output: Case status, retry recommendation, stop reason, escalation recommendation

8. Audit Agent
 Purpose: Logs all actions for compliance and analysis
 Color: Gray (#94a3b8)
 Icon: FileCheck
 How It Works: Records every action, decision, and outcome for regulatory compliance and learning
 Output: Compliance status, violations (if any), recommendations, audit summary



## 👥 USER ROLES & PERMISSIONS

### 1. Merchant
Access Level: Basic
Purpose: Business owners who want to recover their failed payments
Features:
 Upload transaction data via CSV
 Run sandbox simulations
 View merchant dashboard with recovery metrics
 Monitor their specific recovery cases
 Access basic analytics and reports
Cannot Access: Admin settings, other merchants' data, system configuration

### 2. Operations Manager (Ops Manager)
Access Level: Intermediate
Purpose: Daytoday recovery operations and escalation management
Features:
 All Merchant features
 Review and approve escalated cases
 Access operations dashboard
 Monitor all recovery queues
 View agent performance metrics
 Manage recovery priorities
 Override automated decisions
Cannot Access: Admin system settings, user management

### 3. Admin
Access Level: Advanced
Purpose: System administration and configuration
Features:
 All Ops Manager features
 Manage users and roles
 Configure system policies
 Monitor system health and performance
 Access admin dashboard
 Set recovery thresholds and rules
 View comprehensive analytics
 Manage API integrations
Full Access: Complete system control

### 4. Demo Tester
Access Level: Testing
Purpose: Testing and validation of system features
Features:
 All testing capabilities
 Run controlled simulations
 Access all dashboards for testing
 View agent reasoning and logs
 Test workflow without production impact
 Access agent workbench
Limitations: Cannot make permanent system changes



## 🚀 KEY FEATURES

### 1. Intelligent Data Upload
 CSV bulk import with validation
 Automatic transaction processing
 Realtime data validation
 Sample template download
 Support for multiple transaction types

### 2. Sandbox Simulator
 Controlled testing environment
 Multiple event simulation (28 events)
 Custom scenario creation
 Realtime agent monitoring
 Outcome prediction
 Safe testing without production impact

### 3. Live Dashboard
 Realtime recovery metrics
 KPI cards with animated counters
 Recovery funnel visualization
 Agent status monitoring
 Revenue tracking
 Success rate analytics

### 4. Case Management
 Detailed case views with full history
 Agent timeline with reasoning
 Customer information display
 Transaction details
 Recovery probability tracking
 ENRV calculations
 Manual retry capabilities

### 5. Agent Workbench
 View all 8 agents and their purposes
 Detailed agent reasoning logs
 Stepbystep workflow visualization
 Evidence trail for each decision
 Performance metrics per agent
 Debugging and analysis tools

### 6. Recovery Queue
 Prioritized case listing
 Filter by status and priority
 Bulk operations
 Queue management
 Realtime status updates
 Escalation management

### 7. Analytics & Reporting
 Comprehensive overview reports
 Agent performance analytics
 Recovery type analysis
 Costbenefit analysis
 Timebased reporting (7d, 30d, 90d)
 Export capabilities
 Visual charts and graphs

### 8. Realtime Notifications
 Socket.IO powered live updates
 Case status changes
 Escalation alerts
 Recovery successes
 System notifications
 Rolespecific alerts

### 9. Smart Escalation
 Automatic highvalue case escalation
 Human approval workflows
 Multilevel escalation paths
 Approval tracking
 Audit trail for escalations

### 10. Settings & Configuration
 User profile management
 Notification preferences
 Security settings
 Rolebased access control
 System configuration (Admin only)



## 📊 HOW AGENTS INTERACT & WORK

### Complete Workflow Sequence

```
1. TRANSACTION ENTERS SYSTEM
   ↓
2. DETECTION AGENT: Analyzes transaction data
   ↓ Determines if revenue is at risk
   ↓
3. DIAGNOSIS AGENT: AI analyzes root cause
   ↓ Determines why payment failed
   ↓
4. PRIORITY AGENT: Calculates ENRV and priority
   ↓ Ranks case in recovery queue
   ↓
5. DECISION AGENT: Selects best recovery action
   ↓ Chooses optimal intervention strategy
   ↓
6. ESCALATION AGENT: Checks if human approval needed
   ↓ If highvalue/complex → Escalate
   ↓ If approved → Continue
   ↓
7. EXECUTION AGENT: Performs recovery action
   ↓ Executes chosen intervention
   ↓
8. MONITOR AGENT: Evaluates results
   ↓ Success → Mark recovered
   ↓ Failure → Try fallback or stop
   ↓
9. AUDIT AGENT: Logs everything
   ↓ Records compliance and evidence
   ↓
10. CASE COMPLETION: Final status determination
```

### Agent Interaction Examples

Scenario 1: Technical Failure
 Detection: "Critical risk detected"
 Diagnosis: "Temporary infrastructure issue" (85% confidence)
 Priority: "HIGH priority, ENRV ₹45,000"
 Decision: "Auto Retry (free, 85% success rate)"
 Escalation: "No escalation needed"
 Execution: "Auto Retry initiated"
 Monitor: "Success! Payment recovered"
 Audit: "Compliant  technical fix successful"

Scenario 2: PromisetoPay High Value
 Detection: "Critical risk detected"
 Diagnosis: "Customer pledged to pay later" (92% confidence)
 Priority: "CRITICAL priority, ENRV ₹36,432"
 Decision: "WhatsApp Reminder → Voice Call fallback"
 Escalation: "Escalated to Ops Manager (₹50,600 amount)"
 Human Approval: "Ops Manager approves"
 Execution: "Voice Call executed"
 Monitor: "Success via direct contact"
 Audit: "Compliant  human intervention successful"

Scenario 3: Customer Abandonment
 Detection: "Medium risk detected"
 Diagnosis: "User abandoned checkout" (70% confidence)
 Priority: "MEDIUM priority, ENRV ₹8,500"
 Decision: "Email Followup → WhatsApp fallback"
 Escalation: "No escalation needed"
 Execution: "Email sent, no response"
 Monitor: "Fallback to WhatsApp, success"
 Audit: "Compliant  multichannel success"



## 🧪 COMPREHENSIVE TESTING GUIDE

### PreTesting Setup

1. Environment Setup
```bash
# Backend Setup
cd C:\Users\hp\Desktop\razorpay\backend
npm install
npm start

# Frontend Setup  
cd C:\Users\hp\Desktop\razorpay\frontend
npm install
npm run dev
```

2. Create Test Users
You need users for each role to test all features:

Admin User:
 Email: admin@test.com
 Password: admin123
 Role: admin

Ops Manager User:
 Email: ops@test.com  
 Password: ops123
 Role: ops_manager

Merchant User:
 Email: merchant@test.com
 Password: merchant123
 Role: merchant

Demo Tester User:
 Email: tester@test.com
 Password: tester123
 Role: demo_tester

### Testing Script for All Roles

PHASE 1: MERCHANT ROLE TESTING

Test 1.1: User Registration & Login
1. Navigate to http://localhost:5174/login
2. Click "Register" 
3. Fill form:
    Name: Test Merchant
    Email: merchant@test.com
    Password: merchant123
    Role: merchant
4. Verify successful registration and redirect to dashboard
5. Logout and login again to test authentication

Test 1.2: Dashboard Navigation
1. Login as merchant
2. Verify merchant dashboard loads
3. Check KPI cards display correctly
4. Verify recovery funnel visualization
5. Check recent transactions list
6. Navigate between different sections

Test 1.3: CSV Data Upload
1. Go to Data Upload page
2. Download sample CSV template
3. Create test CSV with sample data:
   ```csv
   transactionId,customerName,customerEmail,customerPhone,amount,type,status,failureReason,paymentMethod
   TEST001,John Doe,john@test.com,+91 9876543210,15000,payment,failed,gateway_timeout,upi
   TEST002,Jane Smith,jane@test.com,+91 9876543211,25000,checkout,abandoned,user_exit,card
   ```
4. Upload the CSV file
5. Verify data validation and processing
6. Check that transactions appear in dashboard

Test 1.4: Sandbox Simulation
1. Navigate to Sandbox Simulator
2. Create single simulation event:
    Customer Name: Test Customer
    Amount: 50000
    Type: payment_failure
    Failure Reason: user_exit
    Customer Type: vip
    Event Type: promise_to_pay
3. Submit simulation
4. Monitor realtime agent updates
5. Check case creation and workflow progress
6. Verify final case status

Test 1.5: Case Management
1. Navigate to Recovery Queue
2. Click on a created case
3. Verify case details page loads
4. Check agent timeline and reasoning
5. Verify customer information display
6. Check transaction details
7. Test manual retry if available

Test 1.6: Analytics View
1. Navigate to Analytics page
2. Verify overview charts load
3. Check time range filters (7d, 30d, 90d)
4. Verify agent performance metrics
5. Check recovery type analysis
6. Review cost analysis reports

Expected Results: Merchant should successfully upload data, run simulations, view cases, and access analytics without errors.



PHASE 2: OPS MANAGER ROLE TESTING

Test 2.1: Ops Manager Registration & Login
1. Register as ops_manager (ops@test.com)
2. Login and verify ops dashboard loads
3. Check for additional features compared to merchant

Test 2.2: Escalation Management
1. Create a highvalue case (≥₹10,000) as merchant
2. Logout and login as ops manager
3. Navigate to Recovery Queue
4. Find escalated cases (should be marked)
5. Click on escalated case
6. Review case details and agent reasoning
7. Test "Approve" button
8. Verify workflow resumes after approval
9. Test "Reject" button on another case
10. Verify rejected case stops appropriately

Test 2.3: Queue Management
1. Navigate to Recovery Queue
2. Test filtering by status (detected, diagnosed, prioritized, escalated, etc.)
3. Test filtering by priority (CRITICAL, HIGH, MEDIUM, LOW)
4. Test sorting options
5. Verify bulk operations if available

Test 2.4: Agent Monitoring
1. Navigate to Live Agents page
2. Verify all 8 agents are displayed
3. Check agent status indicators
4. Monitor realtime agent activity
5. Verify agent performance metrics

Test 2.5: Agent Workbench
1. Navigate to Agent Workbench
2. Select a specific case
3. View detailed agent reasoning for each step
4. Check evidence trail for decisions
5. Verify agent interaction flow
6. Test filtering logs by agent type

Test 2.6: Operations Dashboard
1. Navigate to Ops Dashboard
2. Verify operationsspecific metrics
3. Check queue performance indicators
4. Monitor escalation rates
5. Review team productivity metrics

Expected Results: Ops manager should successfully manage escalations, monitor agents, access workbench, and view operationsspecific analytics.



PHASE 3: ADMIN ROLE TESTING

Test 3.1: Admin Registration & Login
1. Register as admin (admin@test.com)
2. Login and verify admin dashboard loads
3. Check for adminspecific features

Test 3.2: User Management
1. Navigate to Admin Panel
2. Go to User Management section
3. View all registered users
4. Test creating new users with different roles
5. Test modifying user roles
6. Test deactivating users
7. Verify permission changes take effect

Test 3.3: System Configuration
1. Navigate to Admin Panel
2. Go to System Settings
3. Modify recovery thresholds
4. Configure escalation rules
5. Set notification preferences
6. Test API configuration settings
7. Verify changes persist

Test 3.4: Policy Management
1. Navigate to Policy Management
2. View current recovery policies
3. Test modifying action costs
4. Update success rates
5. Configure escalation thresholds
6. Save and verify policy changes

Test 3.5: System Health Monitoring
1. Navigate to Admin Dashboard
2. Check system health indicators
3. Verify database connection status
4. Monitor API performance
5. Check AI service status
6. Review system logs if available

Test 3.6: Comprehensive Analytics
1. Navigate to Analytics as admin
2. Access adminspecific reports
3. View systemwide recovery metrics
4. Check user activity reports
5. Review financial impact analysis
6. Test exporting reports

Expected Results: Admin should successfully manage users, configure system, monitor health, and access comprehensive analytics.



PHASE 4: DEMO TESTER ROLE TESTING

Test 4.1: Tester Registration & Login
1. Register as demo_tester (tester@test.com)
2. Login and verify testing capabilities
3. Check access to all dashboards for testing

Test 4.2: Comprehensive Simulation Testing
1. Navigate to Sandbox Simulator
2. Test single event simulation with all parameters:
    Different customer types (regular, vip, enterprise)
    Various failure reasons
    Different event types
    Varying amounts (low, medium, high)
3. Test batch simulation (28 events)
4. Monitor agent behavior for each scenario
5. Verify workflow completes correctly

Test 4.3: Edge Case Testing
1. Test with ₹0 amount transactions
2. Test with extremely high amounts (₹1,00,000+)
3. Test with invalid customer data
4. Test with special characters in names
5. Test with duplicate transaction IDs
6. Verify system handles edge cases gracefully

Test 4.4: Agent Interaction Testing
1. Create cases designed to trigger specific agents:
    Technical failure → Should use auto_retry
    Promisetopay → Should escalate and use different strategies
    Customer abandonment → Should use multichannel approach
2. Monitor agent decisions and reasoning
3. Verify agent interaction sequence
4. Check fallback mechanisms work correctly

Test 4.5: Notification Testing
1. Create cases that trigger different notifications
2. Monitor realtime Socket.IO updates
3. Verify notification content accuracy
4. Check notification timing
5. Test notification persistence

Test 4.6: Workflow State Testing
1. Test all possible case states:
    detected → diagnosed → prioritized → decided → executing → recovered
    detected → diagnosed → prioritized → decided → executing → stopped
    detected → diagnosed → prioritized → decided → escalated → approved → executing → recovered
    detected → diagnosed → prioritized → decided → escalated → rejected → stopped
2. Verify state transitions work correctly
3. Check audit trail for each transition

Expected Results: Demo tester should successfully test all features, simulate various scenarios, and verify system behavior without production impact.



### ADVANCED TESTING SCENARIOS

Scenario 1: Complete PromisetoPay Workflow
Objective: Test the enhanced promisetopay recovery with smart action selection

Steps:
1. Login as demo tester
2. Create simulation with:
    Amount: ₹50,600
    Event Type: promise_to_pay
    Customer Type: enterprise
    Failure Reason: user_exit
3. Monitor agent timeline:
    Detection Agent should identify critical risk
    Diagnosis Agent should recognize promisetopay pattern
    Priority Agent should calculate CRITICAL priority
    Decision Agent should use smart action selection (not auto_retry)
    Escalation Agent should escalate due to high value
4. Login as ops manager
5. Approve the escalated case
6. Monitor execution with different fallback strategy
7. Verify final outcome and audit trail

Expected Result: Smart action selection avoids auto_retry, uses progressive strategies, escalates appropriately, and executes with proper fallback diversity.

Scenario 2: Technical Failure Recovery
Objective: Test technical failure handling with auto_retry

Steps:
1. Create simulation with:
    Amount: ₹15,000
    Event Type: payment_failure
    Failure Reason: gateway_timeout
    Customer Type: regular
2. Monitor agent decisions:
    Diagnosis should identify technical issue
    Decision should select auto_retry first
    No escalation should occur (below threshold)
3. If auto_retry fails, verify fallback to WhatsApp
4. Check final recovery status

Expected Result: Technical failures get auto_retry first, appropriate fallback, no unnecessary escalation.

Scenario 3: MultiEvent Batch Processing
Objective: Test queue management and priority ordering

Steps:
1. Create batch simulation with 5 events:
    Event 1: ₹5,000, low priority
    Event 2: ₹50,000, high priority  
    Event 3: ₹12,000, medium priority
    Event 4: ₹75,000, critical priority
    Event 5: ₹8,000, low priority
2. Monitor queue processing order
3. Verify priority agent orders by ENRV
4. Check that critical cases process first
5. Monitor concurrent processing if applicable

Expected Result: Queue processes by priority, highvalue cases get priority, ENRV calculations correct.

Scenario 4: Escalation Workflow
Objective: Test complete escalation and approval workflow

Steps:
1. Create highvalue case (₹25,000) as merchant
2. Wait for automatic escalation
3. Login as ops manager
4. Find escalated case in queue
5. Review full case details and agent reasoning
6. Test approval workflow
7. Monitor postapproval execution
8. Create another highvalue case
9. Test rejection workflow
10. Verify rejected case stops appropriately

Expected Result: Escalation triggers correctly, approval resumes workflow, rejection stops case, audit trail maintained.

Scenario 5: Notification System
Objective: Test realtime notification system

Steps:
1. Open browser developer tools → Network tab
2. Monitor WebSocket connections
3. Create various case scenarios:
    Successful recovery
    Failed recovery
    Escalation required
    Case approved/rejected
4. Verify Socket.IO events fire correctly
5. Check notification content and timing
6. Test notification persistence across page refresh
7. Verify rolespecific notifications

Expected Result: Realtime notifications work correctly, content accurate, timing appropriate, persist across sessions.



## 📈 REPORTING & ANALYTICS

### How to View Reports

1. Dashboard Reports
 Location: Each role's dashboard
 Content: Realtime KPIs, recovery metrics, recent activity
 Access: Available to all roles based on permissions

2. Analytics Reports
 Location: Analytics page
 Features:
   Overview charts (recovery trends, success rates)
   Agent performance metrics
   Recovery type breakdown
   Cost analysis
   Timebased filtering (7d, 30d, 90d)
 Export: Download reports as CSV/PDF

3. Case Reports
 Location: Individual case details
 Content: Full case history, agent timeline, audit trail
 Export: Generate casespecific reports

4. Agent Workbench Reports
 Location: Agent Workbench page
 Content: Detailed agent reasoning, evidence logs, performance metrics
 Filtering: By agent type, case, time range

5. Admin Reports
 Location: Admin Panel
 Content: Systemwide metrics, user activity, financial impact
 Advanced: Crossrole analytics, system health reports

### Report Types Available

1. Recovery Overview Report
    Total revenue recovered
    Recovery success rate
    Average recovery time
    Cost vs. recovery analysis

2. Agent Performance Report
    Individual agent success rates
    Decision accuracy
    Processing time
    Error rates

3. Customer Analysis Report
    Customer type breakdown
    Recovery by customer segment
    Repeat failure analysis
    Customer lifetime impact

4. Financial Impact Report
    ROI analysis
    Cost per recovery
    Revenue protection metrics
    Projected vs. actual recovery

5. Operational Report
    Queue performance
    Escalation rates
    Processing efficiency
    Resource utilization



## 🎯 PROJECT USEFULNESS & BENEFITS

### For Businesses
 Revenue Recovery: Recover 2030% more lost revenue
 Cost Reduction: 60% lower operational costs vs. manual recovery
 Time Savings: Automate 95% of recovery workflow
 Customer Retention: Maintain positive customer relationships
 DataDriven: Make decisions based on AI insights

### For Operations Teams
 Efficiency: Handle 10x more cases with same team size
 Prioritization: Focus on highvalue recoveries first
 Visibility: Realtime dashboards and metrics
 Compliance: Builtin audit trails and reporting
 Scalability: Handle growing transaction volumes

### For Customers
 Better Experience: Gentle, personalized recovery approaches
 Multiple Options: Various payment reminder channels
 Respectful: No aggressive collection tactics
 Convenience: Easy payment completion options
 Transparency: Clear communication about payments

### For Administrators
 Control: Configurable rules and policies
 Insights: Comprehensive analytics and reporting
 Security: Rolebased access and audit trails
 Flexibility: Adaptable to business needs
 Monitoring: Realtime system health tracking



## 🔔 NOTIFICATION SYSTEM TESTING

### Notification Types to Test

1. Case Creation Notifications
    Trigger: New case created
    Recipient: Relevant role based on case type
    Content: Case ID, amount, priority

2. Escalation Notifications
    Trigger: Case escalated for approval
    Recipient: Ops Manager
    Content: Case details, escalation reason, urgency

3. Recovery Success Notifications
    Trigger: Payment successfully recovered
    Recipient: Original case owner
    Content: Amount recovered, recovery method

4. Recovery Failure Notifications
    Trigger: Recovery attempts exhausted
    Recipient: Relevant role
    Content: Failure reason, next steps

5. Approval Notifications
    Trigger: Case approved/rejected by Ops Manager
    Recipient: Case creator
    Content: Approval status, workflow status

### How to Test Notifications

1. Enable Browser Console Monitoring
   ```javascript
   // In browser console
   socket.on('notification', (data) => {
       console.log('Notification received:', data);
   });
   ```

2. Monitor Network Tab
    Open Developer Tools → Network
    Filter by WS (WebSocket)
    Monitor Socket.IO connections and events

3. Test Each Notification Type
    Create scenarios that trigger each notification
    Verify notification content accuracy
    Check timing and delivery
    Test notification persistence

4. CrossRole Notification Testing
    Create case as merchant
    Monitor merchant notifications
    Login as ops manager
    Check ops manager receives escalation notifications
    Approve case
    Verify merchant receives approval notification



## 🚨 CASE STATE TESTING

### Test All Possible Case States

1. SUCCESS STATE
How to Create: Run simulation with successful outcome
Expected Behavior:
 Status: "recovered"
 Amount recovered: Full transaction amount
 Agent logs: Show successful execution
 Audit: "Compliant  recovery successful"
 Notification: Success notification sent

2. STOPPED STATE
How to Create: Run simulation with failed outcome
Expected Behavior:
 Status: "stopped"
 Amount recovered: ₹0
 Agent logs: Show failed execution with fallback attempts
 Audit: "Compliant  exhausted attempts"
 Reason: Clear stop reason provided
 Notification: Failure notification sent

3. ESCALATED STATE
How to Create: Create highvalue case (≥₹10,000)
Expected Behavior:
 Status: "escalated"
 Workflow: Paused awaiting approval
 Agent logs: Show escalation reasoning
 Escalation: Pending Ops Manager approval
 Notification: Escalation notification to Ops Manager

4. HALTED STATE
How to Create: Case stopped due to policy or manual intervention
Expected Behavior:
 Status: "stopped" with specific halt reason
 Workflow: Terminated midprocess
 Agent logs: Show halt reason and authority
 Audit: "Compliant  manual halt"
 Reason: Clear explanation provided

5. PENDING STATE
How to Create: Simulation with "pending" outcome
Expected Behavior:
 Status: "executing" or awaiting external result
 Workflow: Paused for external callback
 Agent logs: Show awaiting external provider
 Notification: Pending status notification
 Retry: Manual retry available

### State Transition Testing

Test Path 1: detected → diagnosed → prioritized → decided → executing → recovered
Test Path 2: detected → diagnosed → prioritized → decided → executing → stopped
Test Path 3: detected → diagnosed → prioritized → decided → escalated → approved → executing → recovered
Test Path 4: detected → diagnosed → prioritized → decided → escalated → rejected → stopped
Test Path 5: detected → diagnosed → prioritized → decided → executing → pending → manual retry → recovered



## 🛠️ TROUBLESHOOTING GUIDE

### Common Issues & Solutions

Issue 1: Backend Won't Start
Symptoms: "MongoDB Connection Failed" error
Solution:
 Check MongoDB is running
 Verify MONGODB_URI in .env file
 Check network connectivity to MongoDB

Issue 2: Frontend Can't Connect to Backend
Symptoms: API calls failing, CORS errors
Solution:
 Verify backend is running on port 5000
 Check CLIENT_URL in backend .env
 Verify VITE_API_URL in frontend .env

Issue 3: Groq API Errors
Symptoms: "Groq request failed" errors
Solution:
 Verify GROQ_API_KEY in backend .env
 Check Groq API status
 Set GROQ_LOCAL_FALLBACK=true for testing

Issue 4: Socket.IO Not Working
Symptoms: No realtime updates
Solution:
 Check Socket.IO connection in browser console
 Verify backend Socket.IO configuration
 Check firewall/proxy settings

Issue 5: Permission Errors
Symptoms: "Not authorized" errors
Solution:
 Verify user role has required permissions
 Check JWT token validity
 Ensure correct authentication headers



## 📝 TESTING CHECKLIST

### Complete Testing Checklist

User Management
 [ ] Register all 4 role types
 [ ] Test login/logout for each role
 [ ] Verify rolebased permissions
 [ ] Test user profile management
 [ ] Verify session management

Data Upload
 [ ] Upload CSV with valid data
 [ ] Test CSV validation
 [ ] Upload invalid CSV (error handling)
 [ ] Download sample template
 [ ] Verify data processing

Simulation
 [ ] Single event simulation
 [ ] Batch simulation (28 events)
 [ ] All customer types
 [ ] All failure reasons
 [ ] All event types
 [ ] Various amount ranges

Agent Workflow
 [ ] Detection agent functioning
 [ ] Diagnosis agent AI analysis
 [ ] Priority agent ENRV calculation
 [ ] Decision agent action selection
 [ ] Escalation agent approval workflow
 [ ] Execution agent action performance
 [ ] Monitor agent result evaluation
 [ ] Audit agent compliance logging

Case Management
 [ ] View case details
 [ ] Monitor agent timeline
 [ ] Test manual retry
 [ ] Verify case state transitions
 [ ] Check audit trail accuracy

Escalation
 [ ] Highvalue case escalation
 [ ] Promisetopay escalation
 [ ] Ops Manager approval
 [ ] Ops Manager rejection
 [ ] Escalation notification

Notifications
 [ ] Case creation notifications
 [ ] Escalation notifications
 [ ] Success notifications
 [ ] Failure notifications
 [ ] Approval notifications
 [ ] Realtime Socket.IO updates

Analytics
 [ ] Dashboard metrics accuracy
 [ ] Overview reports
 [ ] Agent performance reports
 [ ] Recovery type analysis
 [ ] Cost analysis
 [ ] Report export functionality

Reports
 [ ] Generate overview report
 [ ] Generate agent performance report
 [ ] Generate casespecific report
 [ ] Export reports to CSV
 [ ] Verify report accuracy



## 🎯 PROJECT SUCCESS METRICS

### Key Performance Indicators

1. Recovery Rate: % of failed payments successfully recovered
2. Time to Recovery: Average time from failure to recovery
3. Cost Efficiency: Recovery cost vs. amount recovered
4. Customer Satisfaction: Feedback on recovery experience
5. Agent Accuracy: % of correct agent decisions
6. Escalation Rate: % of cases requiring human intervention
7. System Uptime: % of time system is operational
8. User Adoption: % of eligible users using the system

