
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
import { isIncludeVar, isIncludeTerm } from '../helpers/isInclude'
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


        for (let i = 0; i < produccion_rules.length; i++) {
          head_rule = produccion_rules[i][0];
          console.log(head_rule);
          body_rule = produccion_rules[i][1];

          primeros.value[head_rule] = []
          for (let j = 0; j < body_rule.length; j++) {

            indexInclude = isIncludeVar(body_rule[j], list_Variable.value);
            
            
            if (indexInclude === -1) {
              
              indexInclude = isIncludeTerm(body_rule[j], list_Terminal.value);

              if (indexInclude != -1) {
                console.log(`Primero(${head_rule}) = {${list_Terminal.value[indexInclude]}}`);
                primeros.value[head_rule].push(list_Terminal.value[indexInclude])
              }
              else if(body_rule[j].trim() === "$"){
                console.log(`Primero(${head_rule}) = {${body_rule[j]}}`);
                primeros.value[head_rule].push(body_rule[j])
              } 
              else {
                /**
                 * Cuando la caden empieza con un terminal no definido en el conjunto de terminales
                 */


                list_Terminal.value.push(body_rule[j][0])
                console.log(`Primero(${head_rule}) = {${body_rule[j][0]}}`);
                primeros.value[head_rule].push(body_rule[j][0])

              }

            } else {
              /**
               * Cuando la cadena si empiece con una Variable
               * 
               */

                  let repeticiones = {}
                  vertical_varRule.forEach( regla => repeticiones[regla] = 0)
                  repeticiones[head_rule] = 0
                  let resp_recurs = recursive(vertical_varRule,vertical_varRule[i], primeros.value, dict_produccion_rule.value, list_Terminal.value, repeticiones,  true );
                  primeros.value[head_rule].push( resp_recurs )
                  console.log("SALIO DE RECUR");
                  
                  console.log(`Primero(${head_rule}) = {${resp_recurs.toLocaleString()}}`);
                
                 
            }




          }

        }

        isResolved.value = true

      },

      clean:() => {
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
