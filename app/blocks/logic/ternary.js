export default {
  disabled: true,
  type: 'io_logic_ternary',
  name: "Ternary",
  colour: 60,

  template: `
    if %IF
    then %THEN
    else %ELSE
  `,

  inputs: {
    IF: {
      shadow: 'io_logic_boolean'
    },

    THEN: {
      shadow: 'io_logic_boolean'
    },

    ELSE: {
      shadow: 'io_logic_boolean'
    }
  },

  generators: {
    json: (block, generator) => {
      const
        ifLogic = generator.valueToCode(block, 'IF', 0) || null,
        thenLogic = generator.valueToCode(block, 'THEN', 0) || null,
        elseLogic = generator.valueToCode(block, 'ELSE', 0) || null,
        blockPayload = JSON.stringify({
          conditional: {
            if0: JSON.parse(ifLogic),
            then0: JSON.parse(thenLogic),
            else: JSON.parse(elseLogic)
          }
        })

      return [blockPayload, 0]
    }
  }
}
