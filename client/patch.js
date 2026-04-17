const fs = require('fs');

const apiFile = 'd:/hungprj/client/lib/api.ts';
let apiContent = fs.readFileSync(apiFile, 'utf8');
apiContent = apiContent.replace(
  /getByBrand:\s*\(brandId:\s*string\):\s*Promise<Product\[\]>\s*=>\s*fetchApi\([^)]+\),/,
  match => match + '\n\n  getByCollection: (collectionId: string): Promise<Product[]> =>\n    fetchApi(`/products/collection/${collectionId}`),'
);
fs.writeFileSync(apiFile, apiContent);

const useApiFile = 'd:/hungprj/client/hooks/useApi.ts';
let useApiContent = fs.readFileSync(useApiFile, 'utf8');
useApiContent = useApiContent.replace(
  /export function useProducts\(limit\?:\s*number\)\s*{\s*return useApi<Product\[\]>\(\(\)\s*=>\s*productApi\.getAll\(limit\)\);\s*}/,
  match => match + '\n\nexport function useProductsByCollection(collectionId: string) {\n  return useApi<Product[]>(() => productApi.getByCollection(collectionId), [collectionId]);\n}'
);
fs.writeFileSync(useApiFile, useApiContent);

console.log('done');
