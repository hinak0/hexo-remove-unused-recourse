import * as common from './src/common.js'

const srcDir = common.parseHexoConfig()
const MarkdownAndRec = common.findMarkdownAndRec(srcDir)
const mds = MarkdownAndRec.mdFiles
const recs = MarkdownAndRec.recFiles

const usedRecs = common.getRefs(mds, srcDir)
// console.log(recs)
// console.log(usedRecs)
console.log(recs.filter(item => !usedRecs.includes(item)))
