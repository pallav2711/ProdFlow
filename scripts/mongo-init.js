// =============================================================================
// PRODFLOW AI - MONGODB INITIALIZATION SCRIPT
// =============================================================================

// Switch to the application database
db = db.getSiblingDB('prodflow-ai');

// Create application user
db.createUser({
  user: 'prodflow-app',
  pwd: 'prodflow-app-password',
  roles: [
    {
      role: 'readWrite',
      db: 'prodflow-ai'
    }
  ]
});

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "createdAt": 1 });

db.products.createIndex({ "name": 1 });
db.products.createIndex({ "createdBy": 1 });
db.products.createIndex({ "createdAt": 1 });

db.projectmembers.createIndex({ "productId": 1, "userId": 1 }, { unique: true });
db.projectmembers.createIndex({ "productId": 1 });
db.projectmembers.createIndex({ "userId": 1 });

db.features.createIndex({ "productId": 1 });
db.features.createIndex({ "createdAt": 1 });

db.sprints.createIndex({ "productId": 1 });
db.sprints.createIndex({ "status": 1 });
db.sprints.createIndex({ "startDate": 1 });
db.sprints.createIndex({ "endDate": 1 });

db.tasks.createIndex({ "sprintId": 1 });
db.tasks.createIndex({ "assignedTo": 1 });
db.tasks.createIndex({ "status": 1 });
db.tasks.createIndex({ "workType": 1 });

print('✅ Database initialization completed successfully');
print('✅ Indexes created for optimal performance');
print('✅ Application user created with readWrite permissions');