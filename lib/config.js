/*
 * Create and export configuration variables
 *
 */

// Container for all environments
var environments = {};

// Staging (default) environment
environments.staging = {
  'httpPort' : 3000,
  'httpsPort' : 3001,
  'envName' : 'staging',
  'hashingSecret' : 'thisIsASecret',
  'maxChecks' : 5,
  'stripe' : {
    'token' : 'sk_test_51GyenkLKQMKEz73fS5quvzyRD4MPRx30RqXqAvlfY1VOseHhGZmWq0tsHziKoujIg7QQAxAEYOkx0FgI2bh3RefU00C2DbnL4u',  
  },
  'mailgun' : {
    'apiKey' : '24a70aebd2e0307f95b2e4bb0160eabc-468bde97-8a3d1a42',  
  }

};

// Production environment
environments.production = {
  'httpPort' : 5000,
  'httpsPort' : 5001,
  'envName' : 'production',
  'hashingSecret' : 'thisIsAlsoASecret',
  'maxChecks' : 10,
  'stripe' : {
    'token' : 'sk_test_51GyenkLKQMKEz73fS5quvzyRD4MPRx30RqXqAvlfY1VOseHhGZmWq0tsHziKoujIg7QQAxAEYOkx0FgI2bh3RefU00C2DbnL4u',
  },
  'mailgun' : {
    'apiKey' : '24a70aebd2e0307f95b2e4bb0160eabc-468bde97-8a3d1a42',  
  }
};

// Determine which environment was passed as a command-line argument
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment is one of the environments above, if not default to staging
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// Export the module
module.exports = environmentToExport;