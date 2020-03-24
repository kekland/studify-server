import chalk from 'chalk'

export class Logging {
  private static log(_level: string, _namespace: string, _message: any) {
    let color = chalk.gray

    if (_level === 'V') color = chalk.white
    else if (_level === 'I') color = chalk.cyan
    else if (_level === 'W') color = chalk.yellow
    else if (_level === 'E') color = chalk.red

    const date = chalk.gray(new Date().toISOString())
    const level = color(`[${_level}]`)
    let namespace = color.bold(`[${_namespace}]`)

    namespace = namespace.padEnd(20, " ")

    console.log(`${date} ${level} ${namespace} ${color(_message)}`)
  }

  static verbose(namespace: string, message: any) {
    this.log('V', namespace, message)
  }

  static info(namespace: string, message: any) {
    this.log('I', namespace, message)
  }

  static warning(namespace: string, message: any) {
    this.log('W', namespace, message)
  }

  static error(namespace: string, message: any) {
    this.log('E', namespace, message)
  }
}