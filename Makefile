# 在上一级创建new文件夹
# 并将目录复制至new,除 .git 和 node_modules 文件夹
new: 
	mkdir ../$@ && rsync -av --exclude="node_modules" --exclude=".git" $(CURDIR)/ ../$@

# 
dev: 
	npm run dev 

#
build:
	npm run build
