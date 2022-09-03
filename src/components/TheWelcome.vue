
<template>

  <div v-if="!isCalculating" class="inputs">
    <div>
      <label>Agregar Variable</label>
      <input @keyup.enter="addVariable" v-model="variable" type="text" placeholder="Enter para ingresar Variable">
    </div>

    <div v-if="!isCalculating">
      <label>Agregar Terminales</label>
      <input @keyup.enter="addTerminal" v-model="terminal" type="text" placeholder="Enter para ingresar Variable">
    </div>

  </div>
  <br>
  <div>
    <label> Variables</label>
    <p>V = {{ list_Variable }}</p>
    <label> Terminales </label>
    <p>T = {{ list_Terminal }}</p>  
    <label>Simbolo Inicia</label>
    <p v-if="produc_rule_Test.length > 0">S = {{ produc_rule_Test[0][0] }}</p>
  </div>

  <div v-if="!isCalculating" class="rules">
    <label>Reglas de produccion</label>
    <div>
      <input v-model="simVariable" id="variable" type="text" placeholder="var"> =>
      <input v-model="cadenasProduccion" @keyup.enter="addRule" id="cadenas" type="text">
      <button @click="addRule" id="add-rule">Cerrar regla</button>
    </div>

  </div>
  <br>
  <p v-for=" (product, index)  in produc_rule_Test" :key="index">
    {{ product[0] }} => {{ product[1] }}
  </p>

  <button v-if="produc_rule_Test.length != 0" class="btn-success" @click="calculate">Calcular</button>

  <template v-if="isResolved">
    <div
      v-for="body_resp, index in dict_produccion_rule"
      :key="index"
    >
      <table class="table">
          <thead class="bg-primary text-white">
            <th
              class="table-dark"
            > {{ index }} </th>
          </thead>
          <tbody 
            v-for="primer, index_b in body_resp" :key="index+index_b"
            class="table-light"
            >
            <tr>
              <td>Primero({{primer}})  = { {{ getPrimerAnswer(index, index_b) }} }</td>
              
            </tr>
          </tbody>
      </table>
    </div>
  </template>

  <button 
    v-if="isResolved"
    @click="clean"
    class="btn-success">
    Limpiar
  </button>

</template>

      <script>
import { computed } from 'vue'
import { ref } from 'vue'
import { isInclude } from '../helpers/isInclude'
import { recursive } from '../helpers/recursive'

export default {
  name: 'Calculo',
  setup() {
    const variable = ref('')
    const terminal = ref('')
    const list_Variable = ref([])
    const list_Terminal = ref([])
    const produc_rule_Test = ref([])
    const simVariable = ref('')
    const cadenasProduccion = ref('')
    const isCalculating = ref(false)
    const produccion_rules = []
    const dict_produccion_rule = ref({})
    const vertical_varRule = []
    const primeros = ref({})
    const isResolved = ref(false)


    

    return {
      variable,
      terminal,
      list_Variable,
      produc_rule_Test,
      list_Terminal,
      simVariable,
      cadenasProduccion,
      isCalculating,
      isResolved,
      primeros,
      dict_produccion_rule,

      getPrimerAnswer: computed( () => (variable, index) =>  primeros.value[variable][index]
                                                                .toString().replace("[","")
                                                                .replace(']',"")
                                                                .replace('"','')
                                                                .replace('"','')
      ),
      addVariable: () => {
        if (variable.value === '') return;
        list_Variable.value.push(variable.value.toUpperCase())
        variable.value = ""
      },
      addTerminal: () => {
        if (terminal.value === '') return;
        list_Terminal.value.push(terminal.value.toLowerCase())
        terminal.value = ""
      },
      addRule: () => {
        if (simVariable.value === "" || cadenasProduccion.value.length === 0) return;

        if (!list_Variable.value.includes(simVariable.value.toUpperCase())) {
          list_Variable.value.push(simVariable.value.toUpperCase())
        }

        let rule = [simVariable.value, cadenasProduccion.value]

        produc_rule_Test.value.push([...rule])

        const cadenas = cadenasProduccion.value.split('|')

        produccion_rules.push([simVariable.value, cadenas])
        vertical_varRule.push(simVariable.value)
        dict_produccion_rule.value[simVariable.value] = cadenas
 
        rule = []
        simVariable.value = ""
        cadenasProduccion.value = ""

      },

      calculate: () => {
        isResolved.value = false
        isCalculating.value = true

        let head_rule = '';
        let body_rule = "";
        let indexInclude = -1;

        /**
         * Primer for para iterar la matriz de reglas de produccion
         * En la primer columa se encuentra la Variable de dicha regla -> head_rule
         * En la siguiente columna se encuntra un arreglo con las reglas => body_rule
         */

        for (let i = 0; i < produccion_rules.length; i++) {
          head_rule = produccion_rules[i][0];
          console.log(head_rule);
          body_rule = produccion_rules[i][1];

          primeros.value[head_rule] = [] //Sirve para guardar los calculos de los primeros con su respectica varaible head_rule { head_rule: [result1, result2, ...]}
          
          /**
           * Este for indice j sirve para recorrer las reglas ( body_rule) que tiene la variable head_rule, para resolver cada una de sus cadenas.
           */
          for (let j = 0; j < body_rule.length; j++) {

            /**
             * isIncluye sirve para saber si en la cadena que se esta evaluando su simbolo de inicio es una variable
             * body_rule[j] es la cedena que se esta evaluando
             * list_Variable.value es el arreglo de varaibles que se tiene
             * retorna -1 si es que la cadena no inicia con ninguna variable
             */
            indexInclude = isInclude(body_rule[j], list_Variable.value);
            
            /**
             * Si la cadena evaluada no inicia con una variable entonces...
             */
            if (indexInclude === -1) {
              
              /**
               * Se analiza si la cadena que se está evaluando inicia con un simbolo terminal especial
               * La definicion de "terminal especial" es de mi conocimiento y no aplica para el tema
               * Esto refiere a que el terminal esta conformado por un conjunto de simbolos (ej. id, num, exp1, exp2)
               * para esto la list_Terminal debe contener dichos terminales especiales.
               * body_rule[j] -> Cadena que se está evaluando
               * list_terminales.value -> lista de terminales especiales
               * 
               * retorna un -1 si no se encuetra al inicio uno de los terminales especiales
               * retorna != 1 cuando se encontro el terminal especial que comieza en la posicion 0 de la cadena
               */
              indexInclude = isInclude(body_rule[j], list_Terminal.value);

              /**
               * En caso de enontrase al inicio dicho terminal especial, se aplica la regla numero dos del
               * calculo de conjunto Primero, el cual indica que su conjunto Primero es el terminal.
               * 
               * Por lo tanto Primero(head_rule) = Primero(list_Terminal con el indice del terminal 
               * especial que inicia la cadena evaluada)
               */
              if (indexInclude != -1) {
                console.log(`Primero(${head_rule}) = {${list_Terminal.value[indexInclude]}}`);
                primeros.value[head_rule].push(list_Terminal.value[indexInclude])
              }

              /**
               * En caso contrario...
               * Se analiza si la cadena que se está evaluando contiene un epsilon (en este caso se utiliza $)
               * En caso que sea positiva la afirmación plateada, se aplica la primer regla del calculo del conjunto
               * primero, que indica que su conjunto Primero es el simbolo vacio epsilon, en este caso ($)
               */
              else if(body_rule[j].trim() === "$"){
                console.log(`Primero(${head_rule}) = {${body_rule[j]}}`);
                primeros.value[head_rule].push(body_rule[j])
              } 
              else {
                /**
                 * Cuando la cadena empieza con un terminal no definido en el conjunto de terminales
                 * 
                 * Entonces se procede a agregar el terminal a la lista de Terminales especiales, para agilizar la validacion
                 * de la cadena, aunque el simbolo no sea en este momento un Terminal especial, ya que en este punto se encuentran
                 * los terminales que estan constituidos por un solo caracter (ej. a, b, <, >, =, etc)
                 * 
                 * Para este caso tambien se aplica la segunda regla del calculo del conjunto primero, que indica que el calculo 
                 * del conjunto Primero sera el simbolo terminal con el que inicia la cadena.
                 */

                list_Terminal.value.push(body_rule[j][0])
                console.log(`Primero(${head_rule}) = {${body_rule[j][0]}}`);
                primeros.value[head_rule].push(body_rule[j][0])

              }

            } else {
              /**
               * Si la cadena no empiza con un simbolo terminal (simple, especial o epsilon) es 
               * Cuando la cadena si empieza con una Variable - aqui se aplica la tercera regla del calculo
               * del conjunto primero.
               */

                  let repeticiones = {}

                  /**
                   * Se crea un objeto de repeticiones que calcule cuantas veces hubo recursión en una misma head_rule
                   * con el fin de que no se convierta en un ciclo infinito.
                   * 
                   * Todos los contadores de las head_rule comienzan en 0
                   */
                  vertical_varRule.forEach( regla => repeticiones[regla] = 0)
                  repeticiones[head_rule] = 0

                  /**
                   * Se comienza la recursion 
                   * vertical_Rule[i] donde i indica que variable se esta evaluando en esta iteracion principal
                   * y debido a que vertical?_Rule mantiene en orden de como ls reglas de produccion se evaluaran, 
                   * se obtendra de esta manera la Variable a resolver.
                   */
                  let resp_recurs = recursive(vertical_varRule,vertical_varRule[i], dict_produccion_rule.value, list_Terminal.value, repeticiones,  true );
                  
                  /**
                   * Los resultados se agregan a la lista que se encuentra en primeros, como llave se debe utilizar el head_body (variable)
                   */
                  primeros.value[head_rule].push( resp_recurs )
                  
                  
                  console.log(`Primero(${head_rule}) = {${resp_recurs.toLocaleString()}}`);
                    
            }

          }

        }

        isResolved.value = true

      },

      clean:() => {
        /**
         * Se limpian todas las variables que se utilizaron para el siguiente calculo
         */
        variable.value = ''
        terminal.value = ''
        list_Variable.value = []
        list_Terminal.value = []
        produc_rule_Test.value = []
        simVariable.value = ''
        cadenasProduccion.value = ''
        isCalculating.value = false
        produccion_rules.value = []     
        dict_produccion_rule.value = {}
        vertical_varRule.value = []     
        primeros.value = {}
        isResolved.value = false
      }



    }
  }
}

</script>
<style scoped>
  @import "../assets/bootstrap.min.css";
.inputs {
  display: flex;
  flex-direction: row;
}

.inputs div {
  display: flex;
  flex-direction: column;
  margin-left: 20px;
}

.inputs input,
.inputs button {
  width: 300px;
  height: 40px;
  border-radius: 35px;
  margin-top: 5px;
  font-size: 15px;
  text-align: center;
}

P {
  color: #fff;
}

.rules {
  display: flex;
  flex-direction: column;
}

#variable {
  width: 60px;
  height: 40px;
  border-radius: 10px;
}

#cadenas {
  width: 300px;
  height: 40px;
  border-radius: 16px;
  text-align: center;
  font-size: 16px;
}

#add-rule {
  width: 80px;
  height: 40px;
  border-radius: 10px;
  margin: 0;
  padding: 0;
  font-size: 13px;
}

.btn-success {
  height: 40px;
  width: 100px;
  border-radius: 16px;
  background-color: #00BD7E;
  color: #fff;
}
</style>
