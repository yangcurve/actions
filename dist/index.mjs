// src/hook.ts
import {
  useMutation,
  useQuery
} from "@tanstack/react-query";
import _ from "lodash";
var createClientApi = (actions) => {
  const getAction = (actionKey) => _.get(actions, actionKey);
  return {
    query: (actionKey) => (input, options) => {
      const defaultOptions = {
        queryKey: [...actionKey.split("."), input],
        queryFn: () => getAction(actionKey)(input)
      };
      return useQuery({
        ...defaultOptions,
        ...options
      });
    },
    mutation: (actionKey) => (options) => useMutation({
      mutationKey: actionKey.split("."),
      mutationFn: (input) => getAction(actionKey)(input),
      ...options
    })
  };
};

// src/procedure.ts
import { z } from "zod";
var createProcedure = (createContext) => {
  const getActionBuilder = (schema) => (resolver) => async (input) => await resolver({
    ctx: await createContext(),
    input: schema.parse(input)
  });
  return {
    use: (middleware) => createProcedure(() => createContext().then(middleware)),
    mutation: getActionBuilder(z.void()),
    query: getActionBuilder(z.void()),
    input: (schema) => ({
      mutation: getActionBuilder(schema),
      query: getActionBuilder(schema)
    })
  };
};
export {
  createClientApi,
  createProcedure
};
