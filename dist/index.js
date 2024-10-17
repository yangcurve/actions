"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  createClientApi: () => createClientApi,
  createProcedure: () => createProcedure
});
module.exports = __toCommonJS(src_exports);

// src/hook.ts
var import_react_query = require("@tanstack/react-query");
var import_lodash = __toESM(require("lodash"));
var createClientApi = (actions) => {
  const getAction = (actionKey) => import_lodash.default.get(actions, actionKey);
  return {
    query: (actionKey) => (input, options) => {
      return (0, import_react_query.useQuery)({
        queryKey: [...actionKey.split("."), input],
        queryFn: () => getAction(actionKey)(input),
        ...options
      });
    },
    mutation: (actionKey) => (options) => (0, import_react_query.useMutation)({
      mutationKey: actionKey.split("."),
      mutationFn: getAction(actionKey),
      ...options
    })
  };
};

// src/procedure.ts
var import_zod = require("zod");
var createProcedure = (createContext) => {
  if (!createContext) createContext = async () => ({});
  const getActionBuilder = (schema) => (resolver) => async (input) => await resolver({
    ctx: await createContext(),
    input: schema.parse(input)
  });
  return {
    use: (middleware) => createProcedure(() => createContext().then(middleware)),
    mutation: getActionBuilder(import_zod.z.void()),
    query: getActionBuilder(import_zod.z.void()),
    input: (schema) => ({
      mutation: getActionBuilder(schema),
      query: getActionBuilder(schema)
    })
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createClientApi,
  createProcedure
});
