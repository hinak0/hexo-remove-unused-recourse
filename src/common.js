import fs from 'fs'
import path from 'path'
import YAML from 'yaml'
import readline from 'readline'

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

const parseHexoConfig = () => {
	try {
		const f = fs.readFileSync(HexoConfigPath, 'utf8')
		const hexo_config = YAML.parse(f)
		return hexo_config.source_dir
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

export { getUnUsedRecList, deleteFileList, readListFromFile }
