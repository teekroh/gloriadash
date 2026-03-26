declare module "zipcodes" {
  export interface ZipLookup {
    zip: string;
    city: string;
    state: string;
    latitude: number;
    longitude: number;
  }
  export function lookup(zip: string): ZipLookup | undefined;
  const zipcodes: { lookup: typeof lookup };
  export default zipcodes;
}
