/**
 * Static mappings for easily working with geographic countries and states.
 *
 * @example

  ```typescript

    _.find(stateMapping, m => m.abbrev === 'WA')
   // returns { name: 'Washington', id: 48, abbrev: 'WA' },

   getStateById(3) // returns { name: 'Arkansas', id: 3, abbrev: 'AR' }

  ```
 */
interface State {
    id: number;
    name: string;
    abbrev: string;
}
interface Country {
    id: number;
    name: string;
    abbrev: string;
}
/**
 * Represents geographic states used in NetSuite. First one is blank to allow easy binding to a UI dropdown
 * Contains values for US States, Canadian Provinces, and similar for Australia, Japan, China,
 * Mexico and United Kingdom
 */
export declare const stateMapping: State[];
/**
 * Retrieves the state object for the given internal id else null
 * @param id internal id of the state you wish to find.
 */
export declare const getStateById: (number: any) => State | undefined;
/**
 * Mappings of country abbreviation, name and NetSuite internal id.
 */
export declare const countryMapping: Country[];
/**
 * Retrieves the given country by NS internal id via the static `countryMapping` list.
 * @see `countryMapping`
 * @param id country internal id
 */
export declare const getCountryById: (id: number) => Country | undefined;
export {};
