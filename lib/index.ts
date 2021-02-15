import type { ActorInitSparql } from '@comunica/actor-init-sparql';

/**
 * Tests if a property is an instance of owl:AnnotationProperty
 * @param property The rdf property to test
 * @param queryEngine A sparql query engine
 */
export async function IsAnnotationProperty(property: any, queryEngine: ActorInitSparql): Promise<boolean> {
  const result = await queryEngine.query(`ASK { <${await property}> a <http://www.w3.org/2002/07/owl#AnnotationProperty> }`);
  if (result.type !== 'boolean') {
    throw new Error('Boolean result expected from ASK query')
  }
  return result.booleanResult;
}

/**
 * Generates a typescript JSDoc node describing the particular subject
 * @param subject LDflex subject entity (including iteration handlers)
 * @param queryEngine Sparql query engine that conforms the the ActorInitSparql API
 */
export async function JSDocGenerator(subject: any, queryEngine: ActorInitSparql) {
  // TODO [FUTURE]: REMOVE ANY
  for await (const property of subject.properties.filter((property: any) => IsAnnotationProperty(property, queryEngine))) {

  };
  
}
