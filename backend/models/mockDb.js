import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');

export class MockModel {
  constructor(modelName, schemaFields = {}) {
    this.modelName = modelName;
    this.filePath = path.join(DATA_DIR, `${modelName.toLowerCase()}s.json`);
    this.schemaFields = schemaFields;
    this.initFile();
  }

  initFile() {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
    }
  }

  read() {
    try {
      this.initFile();
      const content = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.error(`Error reading ${this.modelName} data:`, e);
      return [];
    }
  }

  write(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error(`Error writing ${this.modelName} data:`, e);
    }
  }

  // Create an instance helper for .save()
  wrapInstance(item) {
    if (!item) return null;
    const modelInstance = {
      ...item,
      save: async () => {
        const data = this.read();
        const index = data.findIndex(d => d._id === item._id);
        const updatedItem = {
          ...item,
          updatedAt: new Date().toISOString()
        };
        // Remove helper functions before saving to JSON file
        delete updatedItem.save;
        
        if (index > -1) {
          data[index] = updatedItem;
        } else {
          data.push(updatedItem);
        }
        this.write(data);
        return this.wrapInstance(updatedItem);
      }
    };
    return modelInstance;
  }

  matchQuery(item, query) {
    if (!query) return true;
    
    // Support $or query
    if (query.$or && Array.isArray(query.$or)) {
      let anyMatch = false;
      for (const subQuery of query.$or) {
        if (this.matchQuery(item, subQuery)) {
          anyMatch = true;
          break;
        }
      }
      if (!anyMatch) return false;
    }

    for (const key in query) {
      if (key === '$or') continue;
      const val = query[key];
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        if (val instanceof RegExp) {
          if (!val.test(item[key] || '')) return false;
          continue;
        }
        
        // Handle MongoDB operators like $ne, $gte, etc.
        const ops = Object.keys(val);
        for (const op of ops) {
          const targetVal = val[op];
          if (op === '$regex') {
            const options = val.$options || '';
            const regex = new RegExp(targetVal, options);
            if (!regex.test(item[key] || '')) return false;
          }
          if (op === '$options') continue; // Handled alongside $regex
          if (op === '$ne' && item[key] === targetVal) return false;
          if (op === '$eq' && item[key] !== targetVal) return false;
          if (op === '$in') {
            if (!Array.isArray(targetVal)) return false;
            if (!targetVal.includes(item[key])) return false;
          }
          if (op === '$gte' && !(item[key] >= targetVal)) return false;
          if (op === '$lte' && !(item[key] <= targetVal)) return false;
          if (op === '$gt' && !(item[key] > targetVal)) return false;
          if (op === '$lt' && !(item[key] < targetVal)) return false;
        }
      } else {
        // Direct value comparison
        if (item[key] !== query[key]) return false;
      }
    }
    return true;
  }

  async find(query = {}) {
    const data = this.read();
    const results = data.filter(item => this.matchQuery(item, query));
    return results.map(item => this.wrapInstance(item));
  }

  async findOne(query = {}) {
    const data = this.read();
    const item = data.find(item => this.matchQuery(item, query));
    return item ? this.wrapInstance(item) : null;
  }

  async findById(id) {
    const data = this.read();
    const item = data.find(item => item._id === id);
    return item ? this.wrapInstance(item) : null;
  }

  async create(doc) {
    const data = this.read();
    const now = new Date().toISOString();
    const newDoc = {
      _id: Math.random().toString(36).substring(2, 11),
      ...doc,
      createdAt: now,
      updatedAt: now
    };
    data.push(newDoc);
    this.write(data);
    return this.wrapInstance(newDoc);
  }

  async findByIdAndUpdate(id, update, options = { new: true }) {
    const data = this.read();
    const index = data.findIndex(item => item._id === id);
    if (index === -1) return null;
    
    // Support mongoose update operators like $set, $inc, etc. or direct updates
    let updatedFields = { ...update };
    if (update.$set) updatedFields = { ...updatedFields, ...update.$set };
    if (update.$inc) {
      for (const k in update.$inc) {
        updatedFields[k] = (data[index][k] || 0) + update.$inc[k];
      }
    }
    delete updatedFields.$set;
    delete updatedFields.$inc;

    const updatedItem = {
      ...data[index],
      ...updatedFields,
      updatedAt: new Date().toISOString()
    };
    data[index] = updatedItem;
    this.write(data);
    return this.wrapInstance(updatedItem);
  }

  async findByIdAndDelete(id) {
    const data = this.read();
    const index = data.findIndex(item => item._id === id);
    if (index === -1) return null;
    const deleted = data.splice(index, 1)[0];
    this.write(data);
    return this.wrapInstance(deleted);
  }

  async countDocuments(query = {}) {
    const data = this.read();
    return data.filter(item => this.matchQuery(item, query)).length;
  }

  // Helper to register standard models with schemas
  static createMockModel(modelName, schemaFields) {
    return new MockModel(modelName, schemaFields);
  }
}
