const getAllTernminales = ( variables, terminalesActual, reglasProduccion) => {
    
    let terminal_actual = terminalesActual;
    let terminales = new Set(terminal_actual);
    let cadena = ''

    console.log( " varaibles " + variables);
    for (let i = 0; i < reglasProduccion.length; i++) {
        cadena = reglasProduccion[i][1]
        cadena = cadena.replace(' ', '').trim()
        cadena =  cadena.replace('|','')
        
        for (let j = 0; j < variables.length; j++) {
            cadena =  cadena.replace('|','')
            const regex = new RegExp( variables[j], "g" )
            cadena = cadena.replace( regex, '')
        }
        // console.log( "Variables" + cadena );
        for (let k = 0; k < terminalesActual.length; k++) {
            cadena =  cadena.replace('|','')
            cadena = cadena.replace(terminalesActual[k],'')
        }

        // console.log( "Termianles" + cadena );

        for (let l = 0; l < cadena.length; l++) {
            // console.log("SE AGREGO A TERMINALE " + cadena[l]);
            terminales.add(cadena[l])   
        }

    }

    
    
    

    terminales.delete(',');
    terminales.delete('@');
    terminales.delete('|');
    return [...terminales]
}

export default getAllTernminales;