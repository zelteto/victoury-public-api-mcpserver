import { VictouryAPIClient } from '../src/api-client.js';

// Example usage of the Victoury API client
async function main() {
  // Initialize the client
  const client = new VictouryAPIClient({
    baseURL: process.env.VICTOURY_API_URL || 'https://api.victoury.com/v2',
    apiKey: process.env.VICTOURY_API_KEY,
    timeout: 30000,
  });

  try {
    // 1. Authenticate
    console.log('Authenticating...');
    const authResult = await client.authenticate({
      apiKey: process.env.VICTOURY_API_KEY!,
      apiSecret: process.env.VICTOURY_API_SECRET!,
    });
    
    if (!authResult.success) {
      throw new Error('Authentication failed');
    }
    console.log('✅ Authenticated successfully');

    // 2. List products
    console.log('\nFetching products...');
    const products = await client.listProducts({
      page: 1,
      limit: 10,
      category: 'tours',
    });
    
    if (products.success && products.data) {
      console.log(`✅ Found ${products.data.length} products`);
      
      // Display first product
      if (products.data.length > 0) {
        const firstProduct = products.data[0];
        console.log('\nFirst product:');
        console.log(`- Name: ${firstProduct.name}`);
        console.log(`- Price: ${firstProduct.price.amount} ${firstProduct.price.currency}`);
        console.log(`- Duration: ${firstProduct.duration}`);
      }
    }

    // 3. Search for a customer
    console.log('\nSearching for customers...');
    const customers = await client.searchCustomers({
      query: 'john',
      limit: 5,
    });
    
    if (customers.success && customers.data && customers.data.length > 0) {
      console.log(`✅ Found ${customers.data.length} customers`);
      const firstCustomer = customers.data[0];
      console.log(`- Customer: ${firstCustomer.firstName} ${firstCustomer.lastName}`);
      console.log(`- Email: ${firstCustomer.email}`);
    }

    // 4. Check availability (example)
    if (products.data && products.data.length > 0) {
      console.log('\nChecking availability...');
      const productId = products.data[0].id;
      const availability = await client.listAvailability({
        productId,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week
        participants: 2,
      });
      
      if (availability.success && availability.data) {
        console.log(`✅ Found ${availability.data.length} available dates`);
        
        // Show first available date
        const firstAvailable = availability.data.find(a => a.available);
        if (firstAvailable) {
          console.log(`- First available date: ${firstAvailable.date}`);
          console.log(`- Price: ${firstAvailable.price.amount} ${firstAvailable.price.currency}`);
          console.log(`- Spots available: ${firstAvailable.spotsAvailable}`);
        }
      }
    }

    // 5. Example: Create a booking (commented out to avoid creating test data)
    /*
    if (products.data && products.data.length > 0 && customers.data && customers.data.length > 0) {
      console.log('\nCreating a booking...');
      const booking = await client.createBooking({
        productId: products.data[0].id,
        customerId: customers.data[0].id,
        startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        participants: 2,
        notes: 'Special dietary requirements: vegetarian',
      });
      
      if (booking.success && booking.data) {
        console.log('✅ Booking created successfully');
        console.log(`- Booking ID: ${booking.data.id}`);
        console.log(`- Status: ${booking.data.status}`);
        console.log(`- Total: ${booking.data.totalPrice.amount} ${booking.data.totalPrice.currency}`);
      }
    }
    */

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  }
}

// Run the example
main();