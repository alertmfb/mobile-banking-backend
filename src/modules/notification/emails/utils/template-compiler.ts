import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

export class TemplateCompiler {
  static compile(templateName: string, data: Record<string, any>): string {
    //make it get the path from src folder
    let templatePath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'src',
      'modules',
      'notification',
      'emails',
      'templates',
      `${templateName}.hbs`,
    );
    templatePath = templatePath.replace('/dist', '');
    console.log('templatePath:', templatePath);
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    const compiledTemplate = Handlebars.compile(templateContent);
    return compiledTemplate(data);
  }
}
