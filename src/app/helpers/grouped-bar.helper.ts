import * as d3 from 'd3';
import { GroupStackDataElement } from '../charts/models/chart.models';

export function setStacks(
  data: any,
  domainAttr: string,
  groupAttr: string,
  stackAttr: string,
  valueAttr: string
): GroupStackDataElement[] {
  return d3
    .flatRollup(
      data,
      (v) => d3.sum(v, (d: any) => d[valueAttr]),
      (d: any) => d[domainAttr],
      (d) => d[groupAttr],
      (d) => d[stackAttr]
    )
    .map((element) => ({
      key: element[0] + '-' + element[1] + '-' + element[2],
      domain: element[0],
      group: element[1],
      stack: element[2],
      value: element[3]/10e6,
    }));
}

export const UpdateObjectWithPartialValues = <T>(
  base: T,
  update: Partial<T>
): T => {
  const baseObj: T = Object.assign({}, base);
  const updateObj = Object.assign({}, update);

  // only needed if base is not fully assigned (update contains more properties than base)
  let updatedObj: T = Object.assign({}, base, update);

  for (const key in baseObj) {
    const baseElem = baseObj[key];
    let updatedElem, updateElem;

    if (updateObj.hasOwnProperty(key)) {
      if (baseElem instanceof Object && !Array.isArray(baseElem)) {
        updateElem = updateObj[key] as T[keyof T];
        updatedElem = UpdateObjectWithPartialValues<
          typeof baseElem
        >(baseElem, updateElem as any);
      } else {
        updatedElem = updateObj[key];
      }
    } else {
      updatedElem = baseElem;
    }

    updatedObj = { ...updatedObj, [key]: updatedElem };
  }

  return updatedObj;
};
