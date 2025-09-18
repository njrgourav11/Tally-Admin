const axios = require('axios');
const xml2js = require('xml2js');
const { db } = require('../config/firebase');

class TallyService {
  constructor() {
    this.tallyUrl = `http://localhost:9000`;
  }

  async testConnection() {
    try {
      console.log('Testing Tally connection to:', this.tallyUrl);
      
      const response = await axios.post(this.tallyUrl, this.getConnectionXML(), {
        headers: { 'Content-Type': 'application/xml' },
        timeout: 5000
      });
      
      console.log('Tally connection successful, status:', response.status);
      return response.status === 200;
    } catch (error) {
      console.log('Tally connection failed:', error.message);
      return false;
    }
  }

  async getStockItems() {
    try {
      const xml = `
        <ENVELOPE>
          <HEADER>
            <TALLYREQUEST>Export Data</TALLYREQUEST>
          </HEADER>
          <BODY>
            <EXPORTDATA>
              <REQUESTDESC>
                <REPORTNAME>Stock Summary</REPORTNAME>
                <STATICVARIABLES>
                  <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
                  <EXPLODEFLAG>Yes</EXPLODEFLAG>
                </STATICVARIABLES>
              </REQUESTDESC>
            </EXPORTDATA>
          </BODY>
        </ENVELOPE>`;

      const response = await axios.post(this.tallyUrl, xml, {
        headers: { 'Content-Type': 'application/xml' },
        timeout: 10000
      });
      
      console.log('Raw Tally response:', response.data);
      
      const parser = new xml2js.Parser({ explicitArray: false });
      const result = await parser.parseStringPromise(response.data);
      
      console.log('Parsed XML:', JSON.stringify(result, null, 2));
      
      return this.parseStockItems(result);
    } catch (error) {
      console.log('Failed to fetch from Tally:', error.message);
      console.log('Response data:', error.response?.data);
      return [];
    }
  }

  async syncStockItems() {
    try {
      console.log('Starting sync process...');
      const stockItems = await this.getStockItems();
      
      if (!stockItems || !Array.isArray(stockItems)) {
        throw new Error('No stock items received from Tally');
      }
      
      console.log(`Syncing ${stockItems.length} items to database`);
      
      // Use mock database or real Firebase
      if (db.collection) {
        // Clear existing products
        const existingProducts = await db.collection('products').get();
        const deleteBatch = db.batch();
        
        existingProducts.docs.forEach(doc => {
          deleteBatch.delete(doc.ref);
        });
        
        if (!existingProducts.empty) {
          await deleteBatch.commit();
          console.log(`Deleted ${existingProducts.size} existing products`);
        }
        
        // Add new products
        const addBatch = db.batch();
        
        stockItems.forEach(item => {
          const docRef = db.collection('products').doc();
          addBatch.set(docRef, {
            ...item,
            syncedAt: new Date(),
            images: [],
            description: '',
            attributes: {}
          });
        });
        
        await addBatch.commit();
        console.log(`Added ${stockItems.length} new products`);
      }
      
      return { success: true, count: stockItems.length };
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  }

  parseStockItems(xmlData) {
    const items = [];
    
    try {
      const envelope = xmlData.ENVELOPE;
      
      if (envelope && envelope.DSPACCNAME && envelope.DSPSTKINFO) {
        const names = Array.isArray(envelope.DSPACCNAME) ? envelope.DSPACCNAME : [envelope.DSPACCNAME];
        const stockInfos = Array.isArray(envelope.DSPSTKINFO) ? envelope.DSPSTKINFO : [envelope.DSPSTKINFO];
        
        // Match names with stock info by index
        for (let i = 0; i < Math.min(names.length, stockInfos.length); i++) {
          const name = names[i].DSPDISPNAME || 'Unknown Item';
          const stkInfo = stockInfos[i].DSPSTKCL;
          
          if (stkInfo && name !== 'Running Stock') { // Skip "Running Stock" header
            // Extract quantity and unit from DSPCLQTY (e.g., "10 pcs")
            const qtyStr = stkInfo.DSPCLQTY || '0';
            const qtyMatch = qtyStr.match(/(\d+(?:\.\d+)?)\s*(\w+)?/);
            const quantity = qtyMatch ? parseFloat(qtyMatch[1]) : 0;
            const unit = qtyMatch && qtyMatch[2] ? qtyMatch[2] : 'Nos';
            
            // Only add items with valid data
            if (name && (quantity > 0 || stkInfo.DSPCLRATE)) {
              items.push({
                name: name,
                quantity: quantity,
                unit: unit,
                rate: parseFloat(stkInfo.DSPCLRATE) || 0,
                amount: parseFloat(stkInfo.DSPCLAMTA) || 0,
                lastUpdated: new Date()
              });
            }
          }
        }
      }
      
      console.log(`Parsed ${items.length} stock items from Tally`);
    } catch (error) {
      console.error('Error parsing stock items:', error);
    }
    
    return items;
  }

  getConnectionXML() {
    return `
      <ENVELOPE>
        <HEADER>
          <TALLYREQUEST>Export Data</TALLYREQUEST>
        </HEADER>
        <BODY>
          <EXPORTDATA>
            <REQUESTDESC>
              <REPORTNAME>Company Info</REPORTNAME>
            </REQUESTDESC>
          </EXPORTDATA>
        </BODY>
      </ENVELOPE>`;
  }
}

module.exports = new TallyService();