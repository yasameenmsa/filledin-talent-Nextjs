#!/usr/bin/env node

// Simple test script to verify admin API endpoints
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testAdminStats() {
  try {
    console.log('Testing /api/admin/stats...');
    const response = await fetch(`${BASE_URL}/api/admin/stats`);
    const data = await response.json();

    if (response.ok) {
      console.log('✅ Admin stats API working!');
      console.log('Stats:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Admin stats API failed:', response.status, data);
    }
  } catch (error) {
    console.log('❌ Error testing admin stats:', error.message);
  }
}

async function testAdminActivity() {
  try {
    console.log('Testing /api/admin/activity...');
    const response = await fetch(`${BASE_URL}/api/admin/activity?limit=5`);
    const data = await response.json();

    if (response.ok) {
      console.log('✅ Admin activity API working!');
      console.log('Activities:', data.activities?.length || 0);
    } else {
      console.log('❌ Admin activity API failed:', response.status, data);
    }
  } catch (error) {
    console.log('❌ Error testing admin activity:', error.message);
  }
}

async function testAdminUsers() {
  try {
    console.log('Testing /api/admin/users...');
    const response = await fetch(`${BASE_URL}/api/admin/users?page=1&limit=5`);
    const data = await response.json();

    if (response.ok) {
      console.log('✅ Admin users API working!');
      console.log('Users:', data.users?.length || 0, 'Total:', data.total || 0);
    } else {
      console.log('❌ Admin users API failed:', response.status, data);
    }
  } catch (error) {
    console.log('❌ Error testing admin users:', error.message);
  }
}

async function main() {
  console.log('🧪 Testing Admin API Endpoints\n');

  await testAdminStats();
  console.log('');

  await testAdminActivity();
  console.log('');

  await testAdminUsers();
  console.log('');

  console.log('✅ Testing complete!');
}

main().catch(console.error);
