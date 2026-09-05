// Complete API Testing Script
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const testAPI = async () => {
  console.log('🚀 Starting RevArb AI API Tests...\n');
  
  let token = null;
  let caseId = null;
  
  try {
    // Test 1: Health Check
    console.log('📝 Test 1: Health Check');
    const health = await axios.get(`${API_URL}/health`);
    console.log('✅ Health Check Passed:', health.data.status);
    console.log('---');
    
    // Test 2: Login
    console.log('📝 Test 2: Login');
    const login = await axios.post(`${API_URL}/auth/login`, {
      email: 'merchant@revarbs.ai',
      password: 'password123',
    });
    token = login.data.data.token;
    console.log('✅ Login Successful');
    console.log(`   Token: ${token.substring(0, 20)}...`);
    console.log('---');
    
    // Test 3: Get Dashboard
    console.log('📝 Test 3: Get Dashboard');
    const dashboard = await axios.get(`${API_URL}/dashboard/merchant`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('✅ Dashboard Data:', dashboard.data.data.kpi);
    console.log('---');
    
    // Test 4: Get Transactions
    console.log('📝 Test 4: Get Transactions');
    const transactions = await axios.get(`${API_URL}/transactions?limit=5`);
    console.log(`✅ Retrieved ${transactions.data.count} transactions`);
    console.log('---');
    
    // Test 5: Get Cases
    console.log('📝 Test 5: Get Cases');
    const cases = await axios.get(`${API_URL}/cases?limit=5`);
    console.log(`✅ Retrieved ${cases.data.count} cases`);
    if (cases.data.data.length > 0) {
      caseId = cases.data.data[0]._id;
    }
    console.log('---');
    
    // Test 6: Run Simulation
    console.log('📝 Test 6: Run Simulation');
    const simulation = await axios.post(`${API_URL}/simulation/single`, {
      eventType: 'payment_failure',
      amount: 5000,
      persona: 'regular',
    });
    console.log('✅ Simulation Result:', simulation.data.message);
    console.log('---');
    
    // Test 7: Get Agent Status
    console.log('📝 Test 7: Get Agent Status');
    const agents = await axios.get(`${API_URL}/agents/status`);
    console.log(`✅ Retrieved ${agents.data.data.agents.length} agents status`);
    console.log('---');
    
    // Test 8: Get Analytics
    console.log('📝 Test 8: Get Analytics');
    const analytics = await axios.get(`${API_URL}/analytics/overview?timeRange=7d`);
    console.log('✅ Analytics Summary:', analytics.data.data.summary);
    console.log('---');
    
    // Test 9: Get Notifications
    console.log('📝 Test 9: Get Notifications');
    const notifications = await axios.get(`${API_URL}/notifications`);
    console.log(`✅ Retrieved ${notifications.data.count} notifications`);
    console.log('---');
    
    // Test 10: Get Agent Logs
    console.log('📝 Test 10: Get Agent Logs');
    const logs = await axios.get(`${API_URL}/agents/logs?limit=10`);
    console.log(`✅ Retrieved ${logs.data.count} agent logs`);
    console.log('---');
    
    console.log('🎉 ALL TESTS PASSED SUCCESSFULLY!');
    
  } catch (error) {
    console.error('❌ Test Failed:', error.response?.data || error.message);
  }
};

testAPI();