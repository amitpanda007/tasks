// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: "http://localhost:5000/api/v1/",
  firebase: {
    apiKey: "AIzaSyAolDirCPV3mW11Scb_ethC7O4obTNNEi4",
    authDomain: "taskfrtdy.firebaseapp.com",
    projectId: "taskfrtdy",
    storageBucket: "taskfrtdy.appspot.com",
    messagingSenderId: "1079114804618",
    appId: "1:1079114804618:web:87e9158bc453f807d02c73",
    measurementId: "G-6RP8BL5B8Q",
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
