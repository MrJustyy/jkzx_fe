// 3个分支 就没必要缓存了把，留着给自己以后看。。。
// export const selectFill = createSelector(
//   groupColumns => groupColumns.length,
//   (groupColumns, dataSource) => dataSource.length,
//   (groupColumns, dataSource, noGroup) => noGroup,
//   (groupColumnsLen, dataSourceLen, noGroup) => {
//     if (!dataSourceLen) {
//       return {
//         group: [],
//         field: [],
//       };
//     }
//     if (groupColumnsLen === 0 || noGroup) {
//       return {
//         group: [],
//         field: [EMPTY_HEADER_CELL_TAG],
//       };
//     }
//     return {
//       group: [EMPTY_HEADER_CELL_TAG],
//       field: [EMPTY_HEADER_CELL_TAG],
//     };
//   }
// );
