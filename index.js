#!/usr/bin/env node

'use strict'

const fs = require('fs')
const path = require('path')
const readline = require('readline')

const HexoConfigPath = './_config.yml'
const imageFormats = [
	'.jpg',
	'.jpeg',
	'.png',
	'.gif',
	'.bmp',
	'.webp',
	'.svg',
	'.tiff',
	'.ico',
	'.jp2',
	'.jxr',
	'.pdf',
	'.eps',
	'.ai',
]
const output = 'unusedRecs.list'

const parseHexoConfig = () => {
	try {
		const f = fs.readFileSync(HexoConfigPath, 'utf8')
		const reg = /source_dir:\s*(\S+)/
		const source_dir = f.match(reg)[1]
		return source_dir
	} catch (error) {
		console.error('读取或解析YAML文件时出错:', error)
		throw error
	}
}

const findMarkdownAndRec = dir => {
	const mdFiles = []
	const recFiles = []

	const files = fs.readdirSync(dir)
	for (const file of files) {
		const filePath = path.join(dir, file)

		const stats = fs.statSync(filePath)
		if (stats.isDirectory()) {
			// 递归
			const tmp = findMarkdownAndRec(filePath)
			mdFiles.push(...tmp.mdFiles)
			recFiles.push(...tmp.recFiles)
		} else if (path.extname(filePath).toLowerCase() === '.md') {
			mdFiles.push(filePath)
		} else if (imageFormats.includes(path.extname(filePath).toLowerCase())) {
			recFiles.push(filePath)
		}
	}
	return { mdFiles, recFiles }
}

const getRefs = (files, rootDir = './source') => {
	const imageReg = /!\[[^\]]*\]\(([^)]+)\)/g
	const images = []

	files.forEach(f => {
		const fileContent = fs.readFileSync(f, 'utf-8')
		let match
		while ((match = imageReg.exec(fileContent))) {
			images.push(path.join(rootDir, match[1]))
		}
	})
	return images
}

const getUnUsedRecList = () => {
	const srcDir = parseHexoConfig()
	const MarkdownAndRec = findMarkdownAndRec(srcDir)
	const mds = MarkdownAndRec.mdFiles
	const recs = MarkdownAndRec.recFiles

	const usedRecs = getRefs(mds, srcDir)
	return recs.filter(item => !usedRecs.includes(item))
}

const deleteFileList = fileList => {
	fileList.forEach(fileName => {
		fs.unlink(fileName, err => {
			if (err) {
				console.error(`无法删除文件 ${fileName}: ${err}`)
			} else {
				console.log(`已删除文件 ${fileName}`)
			}
		})
	})
}

const readListFromFile = filePath => {
	try {
		const data = fs.readFileSync(filePath, 'utf8')
		const lines = data.split('\n')
		if (lines[lines.length - 1] === '') {
			lines.pop()
		}
		return lines
	} catch (error) {
		console.error('读取文件时出错:', error)
		return []
	}
}

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
		const rl = readline.createInterface({
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
