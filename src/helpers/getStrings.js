import { isIncludeStrict } from '../helpers/isInclude'

/**
 * 
 * @param {*} produccion_rules 
 * @param {*} list_variables 
 * @param {*} original_head 
 * @returns 
 */
export const getString = ( produccion_rules, list_variables, original_head ) => {

    const produccion_strings = {}
    for (let i = 0; i < produccion_rules.length; i++) {

        /**
         * Se itera cada regla de producción para obtener aquellas cadenas que contengan a ORIGINAL_HEAD
         * 
         * Se otiene la varaible que se esta iterando y se nombra HEAD
         * Se obtienen las cadenas de las reglas de producción para HEAD
         */
        const head = produccion_rules[i][0];
        const body = produccion_rules[i][1];

        
        /**
         * Se crea un objeto que contedra cada variable con las cadenas que contengan a ORIGINAL_HEAD
         */
        produccion_strings[head] = []
        for (let j = 0; j < body.length; j++) {
            
            /**
             * Regresa el indice de la varaible  que se esta buscando en la cadena
             * retorna -1 si no se encontro la varaible en la cadena.
             * retorna el indice si se encontro la varaible en la cadena
             */
            if ( isIncludeStrict(body[j], original_head) != -1 ){
                /**
                 * En caso de ternar la varaible en la cadena se 
                 * agrega la cadena al objeto que guarada unicamente 
                 * las cadenas de producción para la variable ORIGINAL.
                 * 
                 * GUARDANDO COMO REFERENCIA DE QUE VARAIBLE SE ORIGINAL DICHA CADENA.
                 * Esto con relacion a las regla de producción originales
                 */
                produccion_strings[head].push(body[j]);
            }
            
        }

        /**
         * Eliman las variables que no tienen una regla de produccion que contenga a la variable
         * que se está analizando
         */

        if(produccion_strings[head].length === 0){
            delete produccion_strings[head];
        }
        
    }

    return produccion_strings

}