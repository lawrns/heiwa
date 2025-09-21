const fs = require('fs');
const path = require('path');

console.log('Generating comprehensive test data...');

// Generate large client dataset
const generateClients = (count) => {
    const clients = [];
    const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Emma', 'Chris', 'Lisa'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];

    for (let i = 0; i < count; i++) {
        clients.push({
            id: `client-${i + 1}`,
            name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
            email: `client${i + 1}@test.com`,
            phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            brand: Math.random() > 0.5 ? 'Heiwa House' : 'Freedom Routes',
            lastBookingDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
            notes: `Test client ${i + 1} notes`,
            created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString()
        });
    }
    return clients;
};

// Generate bookings data
const generateBookings = (count, clientIds) => {
    const bookings = [];
    const statuses = ['pending', 'confirmed', 'cancelled'];

    for (let i = 0; i < count; i++) {
        const clientId = clientIds[Math.floor(Math.random() * clientIds.length)];
        bookings.push({
            id: `booking-${i + 1}`,
            client_ids: [clientId],
            items: [
                {
                    type: Math.random() > 0.5 ? 'room' : 'surf-camp',
                    quantity: Math.floor(Math.random() * 4) + 1,
                    price: Math.floor(Math.random() * 500) + 100
                }
            ],
            total_amount: Math.floor(Math.random() * 2000) + 200,
            payment_status: statuses[Math.floor(Math.random() * statuses.length)],
            payment_method: Math.random() > 0.5 ? 'stripe' : 'bank_transfer',
            notes: `Test booking ${i + 1}`,
            source: 'dashboard',
            created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString()
        });
    }
    return bookings;
};

// Generate test data
const clients = generateClients(1000);
const clientIds = clients.map(c => c.id);
const bookings = generateBookings(2000, clientIds);

// Write to files
fs.writeFileSync(path.join(__dirname, '../tests/fixtures/large-dataset/clients.json'), JSON.stringify(clients, null, 2));
fs.writeFileSync(path.join(__dirname, '../tests/fixtures/large-dataset/bookings.json'), JSON.stringify(bookings, null, 2));

console.log(`Generated ${clients.length} clients and ${bookings.length} bookings`);
