/**
 * 
 * @param {*} cadena String - En una cadena de texto perteneciente a una regla de proudccion
 * @param {*} list_var Array - Contiene las variables o terminales especiales
 * @returns -1 Si no inicia con una variable o terminal especial, caso contrario se retorna el indice de la variable 
 * o Terminal especial con el que se identifico que inicia la cadena (el indice se otorga con base al orden de la lista 
 * que se proporciona)
 */
export const isInclude = ( cadena = "", list_var = [] ) => {
    let miIndex = -1
    /**
     * Esta función pretende identificar si la cadena que se esta evaluando comienza en 
     * su posición 0 con una variable o terminal especial ( Esto depende de los argumento que se
     * le envie al llamar a esta función)
     */
    list_var.forEach( ( variable, index ) => {
        if ( cadena.includes(variable)) {
            
            if( cadena.indexOf(variable) === 0){
                miIndex =  index
            }
        }
    })

    return miIndex
}


// export const isIncludeTerm = ( cadena = "", list_ter = [] ) => {

//     let miIndex = -1
//     list_ter.forEach( ( terminal, index ) => {
//         if ( cadena.includes(terminal)) {
            
            
//             if( cadena.indexOf(terminal) === 0){

//                 miIndex =  index
//             }
//         }
//     })

//     return miIndex
// }

