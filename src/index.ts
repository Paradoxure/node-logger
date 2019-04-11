import { conf } from './conf';
import moment from 'moment';
import { get } from '@zorzal2/context';

class Severity {
  constructor(
    public number: number,
    public displayName: string,
    public name: string,
    public stream: NodeJS.WriteStream
  ) { }
}

type SeverityName = 'debug' | 'info' | 'warning' | 'error';

let Severities: { [severityName in SeverityName]: Severity } = {
  debug: new Severity(7, 'DEBUG', 'debug', process.stdout),
  info: new Severity(6, 'INFO', 'info', process.stdout),
  warning: new Severity(4, 'WARNING', 'warning', process.stderr),
  error: new Severity(3, 'ERROR', 'error', process.stderr)
};

let globalSeverity: Severity =
  Severities[String(conf.level).toLocaleLowerCase()] || Severities.debug;

class Logger {

  private level: Severity | undefined = undefined;

  constructor(private label: string) { }

  getLevel() {
    return this.level ? this.level.name : globalSeverity.name;
  }

  setLevel(levelName: SeverityName) {
    this.level = Severities[levelName];
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

  protected levelSeverity(): Severity {
    return this.level || globalSeverity;
  }

  private asString(message): string {
    if (typeof message !== 'object') return String(message);
    if (message instanceof Error) return message.stack ? message.stack : message.message;
    return JSON.stringify(message);
  }

  private log(severity: Severity, messages: any[]) {
    if (this.levelSeverity().number >= severity.number) {
      let time = moment().toISOString(true);
      let txID = get('TxID') || '';
      let strings = messages.map(this.asString).join(' ');
      severity.stream.write(`${time} [${this.label}][${txID}] ${severity.displayName}: ${strings}\n`);
    }
    return this;
  }
}

class MainLogger extends Logger {
  constructor() {
    super('');
  }

  protected levelSeverity() {
    return globalSeverity;
  }

  setLevel(levelName: SeverityName) {
    globalSeverity = Severities[levelName];
    return this;
  }

  getLevel() {
    return globalSeverity.name;
  }

  create(label: string, levelName?: SeverityName) {
    const newLogger =  new Logger(label);
    if (levelName) newLogger.setLevel(levelName);
    return newLogger;
  }
}

export default new MainLogger();
