'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');

var androidSdkVersionsChoices = [
  'API 1: Android 1.0',
  'API 2: Android 1.1',
  'API 3: Android 1.5 (Cupcake)',
  'API 4: Android 1.6 (Donut)',
  'API 5: Android 2.0 (Eclair)',
  'API 6: Android 2.0.1 (Eclair)',
  'API 7: Android 2.1 (Eclair)',
  'API 8: Android 2.2 (Froyo)',
  'API 9: Android 2.3 (Gingerbread)',
  'API 10: Android 2.3.3 (Gingerbread)',
  'API 11: Android 3.0 (Honeycomb)',
  'API 12: Android 3.1 (Honeycomb)',
  'API 13: Android 3.2 (Honeycomb)',
  'API 14: Android 4.0 (Ice Cream Sandwich)',
  'API 15: Android 4.0.3 (Ice Cream Sandwich)',
  'API 16: Android 4.1 (Jelly Bean)',
  'API 17: Android 4.2 (Jelly Bean)',
  'API 18: Android 4.3 (Jelly Bean)',
  'API 19: Android 4.4.2 (KitKat)',
  //'API 20: Android L (Preview)'
].map(function(name, value) {
  return {name: name, value: value + 1};
});

var supportLibrariesChoices = [
  {name: 'PlayServices', value:'playServices', checked: false},
  {name: 'Support', value: 'supportV4', checked: false},
  {name: 'AppCompat', value: 'appCompat', checked: false},
  {name: 'GridLayout', value: 'gridLayout', checked: false},
  {name: 'MediaRouter', value: 'mediaRouter', checked: false},
];

var AndyGenerator = yeoman.generators.Base.extend({
  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);

    this.pkg = require('../../package.json');
  },

  askFor: function () {
    var done = this.async();

    // say hello Yo!
    this.log(yosay(this._randomQuote()));

    var prompts = [
      {
        name: 'applicationName',
        message: 'Application name:',
        default: 'My Application'
      },
      {
        name: 'moduleName',
        message: 'Module name:',
        default: 'mobile'
      },
      {
        name: 'packageName',
        message: 'Package name:',
        default: 'com.application.app'
      },
      {
        name: 'minimumApiLevel',
        message: 'Minimum required SDK:',
        type: 'list',
        choices: androidSdkVersionsChoices,
        default: 13 // API 14: Android 4.0 (Ice Cream Sandwich)
      },
      {
        name: 'targetSdk',
        message: 'Target SDK:',
        type: 'list',
        choices: androidSdkVersionsChoices,
        default: 18 // API 19: Android 4.4.2 (KitKat)
      },
      {
        name: 'compileSdkVersion',
        message: 'Compile with:',
        type: 'list',
        choices: androidSdkVersionsChoices,
        default: 18 // API 19: Android 4.4.2 (KitKat)
      },
      {
        name: 'javaLanguageLevel',
        message: 'Java language level:',
        type: 'list',
        choices: [
          {name: '6.0 – @Override in interfaces', value: 'VERSION_1_6'},
          {name: '7.0 – Diamonds, ARM, multi-catch…', value: 'VERSION_1_7'}
        ],
        default: 1 // 7.0 – Let's use an advanced version of Java, plz!
      },
      {
        name: 'theme',
        message: 'Theme:',
        type: 'list',
        choices: [
          'None',
          'Holo Dark',
          'Holo Light',
          'Holo Light with Dark Action Bar'
          ].map(function(name, value) {
            return {name: name, value: value};
          }),
        default: 3 // Holo Light with Dark ActionBar
      },
      {
        name: 'supportLibraries',
        message: 'Support mode:',
        type: 'checkbox',
        choices: supportLibrariesChoices,
        filter: function(values) {
          if (!values) {
            return;
          }
          var answers = {};
          this._.each(supportLibrariesChoices, function(lib) {
            answers[lib.value] = values.indexOf(lib.value) !== -1;
          });
          return {
            enabled: answers,
            values: values
          };
        }.bind(this)
      }
    ];

    this.prompt(prompts, function (answers) {
      this.applicationName = answers.applicationName;
      this.moduleName = answers.moduleName;
      this.packageName = answers.packageName;
      this.packagePath = this.packageName.replace(/\./g, '/');
      this.minimumApiLevelVersion = answers.minimumApiLevel;
      this.targetSdkVersion = answers.targetSdk;
      this.compileSdkVersion = answers.compileSdkVersion;
      this.javaLanguageLevel = answers.javaLanguageLevel;
      this.theme = answers.theme;
      this.supportLibraries = answers.supportLibraries || {};

      done();
    }.bind(this));
  },

  git: function() {
    this.copy('gitignore', '.gitignore');
  },

  app: function() {
    // Generate basic dirs
    this.mkdir(this.moduleName);
    this.mkdir('art');
    this.mkdir('libraries');
    this.mkdir(this.moduleName + '/libs');
    this.mkdir(this.moduleName + '/src');
    this._mkdirs(this.moduleName + '/src', ['main', 'debug', 'release', 'androidTest']);

    // Start with main folder
    this.template('_AndroidManifest.xml', this.moduleName + '/src/main/AndroidManifest.xml');
    this.mkdir(this.moduleName + '/src/main/java/' + this.packagePath);
    this.template('_src/_MainActivity.java', this.moduleName + '/src/main/java/' + this.packagePath + '/MainActivity.java');
    this.directory('_res', this.moduleName + '/src/main/res');

    this.copy('proguard-rules.pro', this.moduleName + '/proguard-rules.pro');
  },

  gradle: function() {
    this.directory('gradle', 'gradle');
    this.directory('tasks', 'tasks');
    this.copy('gradle.properties', 'gradle.properties');
    this.copy('gradlew', 'gradlew');
    this.copy('gradlew.bat', 'gradlew.bat');
    this.copy('version.properties', 'version.properties');
    this.template('config.gradle', 'config.gradle');
    this.template('_settings.gradle', 'settings.gradle');
    this.template('_build.root.gradle', 'build.gradle');
    this.template('_build.app.gradle', this.moduleName + '/build.gradle');
  },

  _randomQuote: function() {
    var quotes = [
      'Yo! Android generator to the rescue! Take for some relax and enjoy life :D!',
      'OK Andy! Generate this app!',
      'Yo! Support this piece of art! http://bit.ly/1fLq5M2',
      'Andy… what are you doing? Please come back! http://bit.ly/1uZboLb'
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  },

  _mkdirs: function(path, dirs, append) {
    append = append ? '/' + append : '';
    dirs.forEach(function(entry) {
      this.mkdir(path + '/' + entry + append);
    }.bind(this));
  }

});

module.exports = AndyGenerator;
