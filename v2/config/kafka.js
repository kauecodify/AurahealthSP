const { Kafka } = require('kafkajs');

class KafkaConfig {
  constructor() {
    this.kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'aurahealthsp-v2',
      brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
      ssl: process.env.KAFKA_SSL === 'true',
      sasl: process.env.KAFKA_SASL_USERNAME ? {
        mechanism: 'plain',
        username: process.env.KAFKA_SASL_USERNAME,
        password: process.env.KAFKA_SASL_PASSWORD
      } : null
    });

    this.producer = null;
    this.consumer = null;
    this.admin = null;
  }

  async connect() {
    try {
      this.producer = this.kafka.producer();
      this.consumer = this.kafka.consumer({ groupId: process.env.KAFKA_GROUP_ID || 'aurahealthsp-group' });
      this.admin = this.kafka.admin();

      await this.producer.connect();
      await this.consumer.connect();
      await this.admin.connect();

      console.log('✅ Kafka connected');
      return true;
    } catch (error) {
      console.error('❌ Kafka connection error:', error.message);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.producer) await this.producer.disconnect();
      if (this.consumer) await this.consumer.disconnect();
      if (this.admin) await this.admin.disconnect();
      console.log('✅ Kafka disconnected');
    } catch (error) {
      console.error('❌ Kafka disconnect error:', error.message);
    }
  }

  async createTopics() {
    try {
      const topics = [
        { name: 'hospital-status', partitions: 3 },
        { name: 'ambulance-location', partitions: 3 },
        { name: 'mei-verification', partitions: 3 },
        { name: 'proposal-submission', partitions: 3 },
        { name: 'emergency-alerts', partitions: 3 },
        { name: 'satellite-commands', partitions: 3 }
      ];

      await this.admin.createTopics({
        topics: topics.map(t => ({
          topic: t.name,
          numPartitions: t.partitions,
          replicationFactor: 1
        }))
      });

      console.log('✅ Kafka topics created');
    } catch (error) {
      if (error.code === 6) {
        console.log('ℹ️ Kafka topics already exist');
      } else {
        console.error('❌ Kafka create topics error:', error.message);
        throw error;
      }
    }
  }

  async sendMessage(topic, message) {
    try {
      if (!this.producer) {
        await this.connect();
      }

      await this.producer.send({
        topic: topic,
        messages: [
          { value: JSON.stringify(message) }
        ]
      });

      console.log(`✅ Kafka message sent to ${topic}`);
    } catch (error) {
      console.error('❌ Kafka send message error:', error.message);
      throw error;
    }
  }

  async consumeMessages(topic, callback) {
    try {
      if (!this.consumer) {
        await this.connect();
      }

      await this.consumer.subscribe({ topic: topic, fromBeginning: true });

      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          const value = JSON.parse(message.value.toString());
          await callback({ topic, partition, value });
        }
      });

      console.log(`✅ Kafka consumer subscribed to ${topic}`);
    } catch (error) {
      console.error('❌ Kafka consume messages error:', error.message);
      throw error;
    }
  }

  async checkConnection() {
    try {
      if (!this.admin) {
        await this.connect();
      }
      const topics = await this.admin.listTopics();
      return { connected: true, topics: topics.length };
    } catch (error) {
      return { connected: false, error: error.message };
    }
  }
}

module.exports = new KafkaConfig();
