import { auditCatalog, formatCatalogAudit } from "./catalog-validation";

const audit = await auditCatalog();
console.log(formatCatalogAudit(audit));
if (audit.failures.length || audit.orphanedData.length) process.exitCode = 1;
