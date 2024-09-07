import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/ShoppingCart.ts'],  
  format: ['esm', 'cjs'],          
  dts: true,                      
  sourcemap: true,                
  clean: true,                    
  minify: true                 
});