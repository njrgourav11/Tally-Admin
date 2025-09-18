const admin = require('firebase-admin');

let db, storage;

try {
  // Try to initialize Firebase if service account exists
  const serviceAccount = require('./serviceAccountKey.json');
  
  if (serviceAccount.project_id !== 'your-project-id') {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
    
    db = admin.firestore();
    storage = admin.storage();
    console.log('Firebase initialized successfully');
  } else {
    throw new Error('Firebase not configured');
  }
} catch (error) {
  console.log('Firebase not configured, using mock database');
  
  // Mock database for development
  const mockData = {
    products: [],
    orders: []
  };
  
  db = {
    collection: (name) => ({
      get: () => Promise.resolve({
        docs: mockData[name]?.map((item, index) => ({
          id: `mock-${index}`,
          data: () => item
        })) || []
      }),
      doc: (id) => ({
        get: () => Promise.resolve({
          exists: true,
          id,
          data: () => mockData[name]?.find(item => item.id === id) || {}
        }),
        update: (data) => Promise.resolve(),
        set: (data) => Promise.resolve()
      }),
      add: (data) => Promise.resolve({ id: `mock-${Date.now()}` }),
      orderBy: () => ({
        get: () => Promise.resolve({
          docs: mockData[name]?.map((item, index) => ({
            id: `mock-${index}`,
            data: () => item
          })) || []
        })
      })
    }),
    batch: () => ({
      set: () => {},
      commit: () => Promise.resolve()
    })
  };
  
  storage = null;
}

module.exports = { admin, db, storage };