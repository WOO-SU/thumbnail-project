/**
 * @format
 */
import 'react-native-get-random-values'; 
import { Buffer } from 'buffer';
import process from 'process'; // require 대신 import 사용

global.Buffer = Buffer;
global.process = process; // 위에서 import한 process 연결

if (typeof btoa === 'undefined') {
  global.btoa = function (str) {
    return Buffer.from(str, 'binary').toString('base64');
  };
}
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
