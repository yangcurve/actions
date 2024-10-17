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
      return useQuery({
        queryKey: [...actionKey.split("."), input],
        queryFn: () => getAction(actionKey)(input),
        ...options
      });
    },
    mutation: (actionKey) => (options) => useMutation({
      mutationKey: actionKey.split("."),
      mutationFn: getAction(actionKey),
      ...options
    })
  };
};

// src/procedure.ts
import { z } from "zod";
var createProcedure = (createContext) => {
  if (!createContext) createContext = async () => ({});
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
