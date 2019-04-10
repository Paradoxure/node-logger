import { conf } from './conf';


class Severity {
  constructor(
    public number: number,
    public name: string,
    public stream: NodeJS.WriteStream
  ) { }
}

type SeverityName = 'debug' | 'info' | 'warning' | 'error';

let Severities: { [severityName in SeverityName]: Severity} = {
  debug: new Severity(7, 'DEBUG', process.stdout),
  info: new Severity(6, 'INFO', process.stdout),
  warning: new Severity(4, 'WARNING', process.stderr),
  error: new Severity(3, 'ERROR', process.stderr)
};

const globalSeverity = (
  Severities[String(conf.level).toLocaleLowerCase()] || Severities.debug
);

class Logger {
  private level: Severity;

  constructor(private label: string, levelName: SeverityName = globalSeverity) {
    this.level = Severities[levelName];
  }

  getLevel() {
    return this.level;
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

  private log(severity: Severity, messages: any[]) {
    if (this.level.number < severity.number) return this;
    severity.stream.write('');
    return this;
  }
}
