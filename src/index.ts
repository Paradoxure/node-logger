import { conf } from './conf';
import moment from 'moment';
import context from '@zorzal2/context';

type LogLevelNames = 'debug' | 'info' | 'warning' | 'error' | 'all' | 'none';

class LogLevel {
  constructor(
    public number: number,
    public name: LogLevelNames,
  ) { }
}

class Severity {
  constructor(
    public number: number,
    public displayName: string,
    public stream: NodeJS.WriteStream
  ) { }
}

let LogLevels: { [logLevelName in LogLevelNames]: LogLevel } = {
  all: new LogLevel(100, 'all'),

  debug: new LogLevel(7, 'debug'),
  info: new LogLevel(6, 'info'),
  warning: new LogLevel(4, 'warning'),
  error: new LogLevel(3, 'error'),

  none: new LogLevel(-1, 'none')
};

let Severities: { [severityName: string]: Severity } = {
  debug: new Severity(7, 'DEBUG', process.stdout),
  info: new Severity(6, 'INFO', process.stdout),
  warning: new Severity(4, 'WARNING', process.stderr),
  error: new Severity(3, 'ERROR', process.stderr)
};

let globalLogLevel: LogLevel =
  LogLevels[String(conf.level).toLowerCase()] || LogLevels.all;

class Logger {

  private level: LogLevel | undefined = undefined;

  constructor(private label: string) { }

  getLevel() {
    return this.level ? this.level.name : globalLogLevel.name;
  }

  setLevel(levelName: LogLevelNames) {
    this.level = LogLevels[levelName];
    return this;
  }

  getLabel() {
    return this.label;
  }

  debug(...messages) {
    this.log(Severities.debug, messages);
  }
  info(...messages) {
    this.log(Severities.info, messages);
  }
  warning(...messages) {
    this.log(Severities.warning, messages);
  }
  error(...messages) {
    this.log(Severities.error, messages);
  }

  protected currentLogLevel(): LogLevel {
    return this.level || globalLogLevel;
  }

  private asString(message): string {
    if (typeof message !== 'object') return String(message);
    if (message instanceof Error) return message.stack ? message.stack : message.message;
    return JSON.stringify(message);
  }

  private log(severity: Severity, messages: any[]) {
    if (this.currentLogLevel().number >= severity.number) {
      let time = moment().toISOString(true);
      let txid = context.get('txid') || '';
      let strings = messages.map(this.asString).join(' ');
      severity.stream.write(`${time} [${this.label}][${txid}] ${severity.displayName}: ${strings}\n`);
    }
    return this;
  }
}

class MainLogger extends Logger {
  constructor() {
    super('');
  }

  protected currentLogLevel() {
    return globalLogLevel;
  }

  setLevel(levelName: LogLevelNames) {
    globalLogLevel = LogLevels[levelName];
    return this;
  }

  getLevel() {
    return globalLogLevel.name;
  }

  create(label: string, levelName?: LogLevelNames) {
    const newLogger =  new Logger(label);
    if (levelName) newLogger.setLevel(levelName);
    return newLogger;
  }
}

export default new MainLogger();
