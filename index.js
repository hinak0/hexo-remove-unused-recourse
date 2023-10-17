import fs from 'fs'
import ReadLine from 'readline'

import {
	getUnUsedRecList,
	deleteFileList,
	readListFromFile,
} from './src/common.js'

const output = 'unusedRecs.list'

fs.access(output, fs.constants.F_OK, err => {
	if (err) {
		console.log('开始搜索无引用资源')
		const unusedList = getUnUsedRecList()
		fs.writeFile(output, unusedList.join('\n'), err => {
			if (err) {
				console.error('写入文件时出错：', err)
			} else {
				console.log(
					`无引用资源列表已经成功保存至${output}, 请确认或修改,然后再次执行`
				)
			}
		})
	} else {
		console.log('无引用资源列表已经存在:	')
		const delList = readListFromFile(output)
		console.log(delList)
		const rl = ReadLine.createInterface({
			input: process.stdin,
			output: process.stdout,
		})
		rl.question('请按回车键确认进行删除：', answer => {
			console.log('确认！')
			deleteFileList(delList)
			rl.close()
		})
	}
})
