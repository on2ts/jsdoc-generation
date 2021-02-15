import type { ActorInitSparql } from '@comunica/actor-init-sparql';
import { ts } from 'ts-morph';
import { TagData } from '../types';

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

// const descriptionPriority: string[] = [
//   dcterms.description,
//   rdfs.comment,
//   skos.note,
//   rdfs.label,
//   dcterms.title
// ]

/**
 * Generates a typescript JSDoc node describing the particular subject
 * @param subject LDflex subject entity (including iteration handlers)
 * @param queryEngine SPARQL query engine that conforms the the ActorInitSparql API.
 * We assume that the engine is reasoned over the ontology and all imports
 * @param descriptionPriority The priority with which a given property is
 * to be used as the primary comment.
 */
export async function JSDocGenerator(subject: any, queryEngine: ActorInitSparql, descriptionPriority: string[] = []) { 
  /**
   * All annotation properties assosiated to the subject, sorted in alphabetical order
   */
  const properties: any[] = await subject.properties.filter((property: any) => IsAnnotationProperty(property, queryEngine))
    .map((property: any) => property)
    .sort();

  /**
   * Data for the JSDoc tags
   */
  const tagsData: TagData[] = await Promise.all(properties.map(
    async property => ({
      tag: `${await property.fragment}`,
      property: `${await property}`,
      comment: `${await subject[`${await property}`]}`
    })
  ))

  /**
   * The property to be used for the main comment. If there are no properties in the
   * description priority list, then the longest annotation is used instead.
   */
  const property = descriptionPriority.find(property => properties.includes(property)) ?? 
    tagsData.reduce(
      (t: TagData | undefined, a: TagData) => t?.comment.length ?? 0 < a.comment.length ? a : t,
      undefined
    )?.property;

  const templateTags = tagsData.filter(tag => tag.property !== property)
    .map(({ tag, comment }: TagData) => ts.factory.createJSDocTemplateTag(
      ts.factory.createIdentifier(tag), undefined, [], comment,
    ))

  const comment = tagsData.find(tag => tag.property === property)?.comment 
  return ts.factory.createJSDocComment(comment, templateTags)
}
