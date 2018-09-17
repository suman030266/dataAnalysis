const express = require('express'),
    expressStatic = require('express-static'),
    // path = require('path'),
    bodyParser = require('body-parser'),
    xlsx = require('node-xlsx'),
    multer = require('multer'),
    fs = require('fs');
    port = 9003,
    app = express();

// 解析body数据
app.use(bodyParser.urlencoded({
    extended: true
}));

let multerObj = multer({
    dest: 'excel' // 存放文件的路径
});
app.use(multerObj.any());


app.all('/getExcel', (req, res)=>{
    let {path: filePath} = req.files[0];
    let excelSheetArr = xlsx.parse(filePath);
    fs.unlinkSync(filePath);
    fs.writeFileSync('./excel/a.excel', JSON.stringify(excelSheetArr));
    let resData = {
        code: 200,
        data: []
    };
    // analysisData(excelSheetArr[0]) 整合后的数据

    let datasss = getPoint(excelSheetArr[0]);
    // drawCharts(datasss.data[0]);

    resData.data = drawCharts(datasss.data[0]);
    res.setHeader('Content-Type', 'application/json;charset=utf-8');
    res.end(JSON.stringify(resData));
});
function analysisData(arr){
    let res = [],
        regCaliber = /^\s+\[订货口径\]/,
        regSeller = /^\s+\[供应商\]/,
        regOrePoint = /^\s+\[矿点\]/,
        regDate = /^\s+\[收货日期\]/;
    res = {
        name: arr.name,
        data: []
    };
    data = arr['data'].map((tr, trIndex, dataArr) =>{
        if(regCaliber.test(tr)){
            return {
                name: tr[0].replace(regCaliber, ''),
                level: 1,
                data: tr,
                levelNames: [xx(dataArr, trIndex, 1)]
            }
        }else if(regSeller.test(tr)){
            return {
                name: tr[0].replace(regSeller, ''),
                level: 2,
                data: tr,
                levelNames: [xx(dataArr, trIndex, 1), xx(dataArr, trIndex, 2)]
            }
        }else if(regOrePoint.test(tr)){
            return {
                name: tr[0].replace(regOrePoint, ''),
                level: 3,
                data: tr,
                levelNames: [xx(dataArr, trIndex, 1), xx(dataArr, trIndex, 2), xx(dataArr, trIndex, 3)]
            }
        }else if(regDate.test(tr)){
            return {
                name: tr[0].replace(regDate, ''),
                level: 4,
                data: tr,
                levelNames: [xx(dataArr, trIndex, 1), xx(dataArr, trIndex, 2), xx(dataArr, trIndex, 3), xx(dataArr, trIndex, 4)]                
            }
        }else{
            return {}
        }
    });
    data.forEach(item1 =>{
        if(item1.level == 1){
            if(res.data.length){
                res.data[0][item1.name] = [];
            }else{
                res.data.push({
                    [item1.name]: []
                });
            }
        }
    });
    data.forEach((item2, item2Index) =>{
        if(item2.level == 2){
            if(res.data[0][item2.levelNames[0]].length){
                res.data[0][item2.levelNames[0]][0][item2.name] = [];
            }else{
                res.data[0][item2.levelNames[0]].push({
                    [item2.name]: []
                });
            }
        }
    });
    data.forEach(item3 =>{
        if(item3.level == 3){
            if(res.data[0][item3.levelNames[0]][0][item3.levelNames[1]].length){
                res.data[0][item3.levelNames[0]][0][item3.levelNames[1]][0][item3.name] = [];
            }else{
                res.data[0][item3.levelNames[0]][0][item3.levelNames[1]].push({
                    [item3.name]: []
                });
            }
        }
    });
    data.forEach(item4 =>{
        if(item4.level == 4){
            if(res.data[0][item4.levelNames[0]][0][item4.levelNames[1]][0][item4.levelNames[2]].length){
                res.data[0][item4.levelNames[0]][0][item4.levelNames[1]][0][item4.levelNames[2]][0][item4.name] = item4.data.slice(1);
            }else{
                res.data[0][item4.levelNames[0]][0][item4.levelNames[1]][0][item4.levelNames[2]].push({
                    [item4.name]: item4.data.slice(1)
                });
            }
        }
    });
    function xx(dataArr, trIndex, level){
        let reg = level > 2 ? (level > 3 ? regDate : regOrePoint) : (level > 1 ? regSeller : regCaliber);
        for(var i = trIndex; i > 0; i--){
            if(reg.test(dataArr[i])){
                return dataArr[i][0].replace(reg, '');
            }
        }
    }
    return res;
}
function getPoint(obj){
    let res = {},
        regOrePoint = /^\s+\[矿点\]/,
        regDate = /^\s+\[收货日期\]/,
        data = [];
    res = {
        name: obj.name,
        data: []
    };
    data = obj['data'].map((tr, trIndex, dataArr) =>{
        if(regOrePoint.test(tr)){
            return {
                name: tr[0].replace(regOrePoint, ''),
                level: 1,
                data: tr,
                levelNames: [xx(dataArr, trIndex, 1)]
            }
        }else if(regDate.test(tr)){
            return {
                name: tr[0].replace(regDate, ''),
                level: 2,
                data: tr,
                levelNames: [xx(dataArr, trIndex, 1), xx(dataArr, trIndex, 2)]                
            }
        }else{
            return {}
        }
    });
    data.forEach(item1 =>{
        if(item1.level == 1){
            if(res.data.length){
                res.data[0][item1.name] = [];
            }else{
                res.data.push({
                    [item1.name]: []
                });
            }
        }
    });
    data.forEach(item2 =>{
        if(item2.level == 2){
            res.data[0][item2.levelNames[1]].push({
                [item2.name]: item2.data.slice(6, 7)
            });
        }
    });
    function xx(dataArr, trIndex, level){
        let reg = level > 1 ? regOrePoint : regDate;
        for(var i = trIndex; i > 0; i--){
            if(reg.test(dataArr[i])){
                return dataArr[i][0].replace(reg, '');
            }
        }
    }
    
    return res;
}
function drawCharts(obj){
    let res = {};
    let ary = [];
    Object.keys(obj).forEach(item =>{
        res[item] = [];
    });
    Object.keys(obj).forEach(item =>{
        ary = [];
        obj[item].forEach(items=>{
            items && Object.keys(items).forEach(date =>{
                ary.push({
                    date,
                    num: items[date][0]
                })
            });
        });
        res[item] = ary;
    });
    return res;
}

//设置静态文件地址
app.use(expressStatic(`${__dirname}/www`));

app.all(`*`, (req, res)=>{
    res.send(`sorry, 您访问的资源不存在`);
});

app.listen(port, ()=>{
    console.log(`server is startd at ${port}`);
});



