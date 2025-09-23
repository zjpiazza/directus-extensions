import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import fg from "fast-glob";
import Handlebars from "handlebars";
import { parse as parseYaml, stringify } from "yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loadAndHydrateTemplates(
  context: Record<string, unknown>
): Promise<Array<{ file: string; data: unknown }>> {
  const templatesDir = path.join(__dirname, "./templates");
  console.log(`Searching for templates in: ${templatesDir}`);
  const files = await fg("**/*.yaml.hbs", {
    cwd: templatesDir,
    absolute: true,
  });
  console.log(`Found files: ${files}`);

  // Optional: register helpers
  Handlebars.registerHelper("default", (v: any, d: any) => (v == null ? d : v));
  Handlebars.registerHelper('k8s-namespace', function (tenantName, environment) {
    const a = tenantName == null ? '' : tenantName;
    const b = environment == null ? '' : environment;
    if (a && b) {
      return `${a}-${b}`;
    }
    return a || b || '';
  });

  const results: Array<{ file: string; data: unknown }> = [];
  for (const file of files) {
    const tplStr = await fs.readFile(file, "utf8");
    const compiled = Handlebars.compile(tplStr, { noEscape: true });

    // First render text template, then parse YAML
    const rendered = compiled(context);
    console.log(`Rendered contents of ${file}: ${rendered}`);
    const data = parseYaml(rendered);

    results.push({ file: path.basename(file).replace(/\.hbs$/, ""), data });
  }
  return results;
}