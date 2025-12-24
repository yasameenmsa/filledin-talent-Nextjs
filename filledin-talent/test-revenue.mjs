#!/usr/bin/env node

// Simple test script to verify revenue tracking system
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testRevenueAnalytics() {
  try {
    console.log('Testing /api/revenue/analytics...');
    const response = await fetch(`${BASE_URL}/api/revenue/analytics?period=month`);
    const data = await response.json();

    if (response.ok) {
      console.log('✅ Revenue analytics API working!');
      console.log('Overview:', {
        totalRevenue: data.overview?.totalRevenue || 0,
        totalTransactions: data.overview?.totalTransactions || 0,
        growthRate: data.overview?.growthRate || 0,
      });
    } else {
      console.log('❌ Revenue analytics API failed:', response.status, data);
    }
  } catch (error) {
    console.log('❌ Error testing revenue analytics:', error.message);
  }
}

async function testRevenueRecords() {
  try {
    console.log('Testing /api/revenue...');
    const response = await fetch(`${BASE_URL}/api/revenue?page=1&limit=5`);
    const data = await response.json();

    if (response.ok) {
      console.log('✅ Revenue records API working!');
      console.log('Records:', data.revenue?.length || 0, 'Total:', data.total || 0);
    } else {
      console.log('❌ Revenue records API failed:', response.status, data);
    }
  } catch (error) {
    console.log('❌ Error testing revenue records:', error.message);
  }
}

async function main() {
  console.log('🧪 Testing Revenue Tracking System\n');

  await testRevenueAnalytics();
  console.log('');

  await testRevenueRecords();
  console.log('');

  console.log('✅ Testing complete!');
}

main().catch(console.error);

