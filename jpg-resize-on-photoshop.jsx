// Photoshopを起動
// サイズ単位をpxに変更
// 元画像が格納されているフォルダ選択ダイアログを表示（-1）
// 処理後のjpg書き出し用に-1/outフォルダを新規作成
// -1フォルダ内の.jpgオブジェクトの総数を表示
// 見つかった総オブジェクトに対して順に
//// 開く
//// サイズ：600x600px、画質：元画像のサイズに応じて9か12を設定
//// 保存せずに閉じる
// Written by isiwari
 
// Photoshop最新版を起動
#target photoshop
app.bringToFront(); // 起動させたアプリを前面に移動
preferences.rulerUnits = Units.PIXELS; // アプリ内でのサイズ単位をピクセルに統一

// 処理開始前の描画色・背景色を取得
var fgColor= app.foregroundColor;
var bgColor= app.backgroundColor;

// 描画色：黒を指定
var cObj= new SolidColor();
cObj.rgb.red= 0;
cObj.rgb.green= 0;
cObj.rgb.blue= 0;
app.foregroundColor= cObj;

// 背景色：白を指定
var cObjB= new SolidColor();
cObjB.rgb.red= 255;
cObjB.rgb.green= 255;
cObjB.rgb.blue= 255;
app.backgroundColor= cObjB;

// 最後のsaveAsで使用するjpg書き出し設定（JPEG保存関数）
var jpgOpt = new JPEGSaveOptions();
jpgOpt.embedColorProfile= false; // カラープロファイルを埋め込まない
jpgOpt.matte= MatteType.WHITE; // 「web用に保存」で言うマット色
jpgOpt.formatOptions = FormatOptions.PROGRESSIVE; // プログレッシブはWEBに最適化されたJPEG形式、ファイル容量軽
jpgOpt.scans= 3; // プログレッシブ時はスキャン数設定が必須セット
jpgOpt.quality= 9; // 画質

// 最後のsaveAsで使用するjpg書き出し設定（JPEG保存関数）_元が低画質ver
var jpgOpt_Low = new JPEGSaveOptions();
jpgOpt_Low.embedColorProfile= false;
jpgOpt_Low.matte= MatteType.WHITE;
jpgOpt_Low.formatOptions= FormatOptions.PROGRESSIVE;
jpgOpt_Low.scans= 3;
jpgOpt_Low.quality= 12;

// 選択ダイアログで指定されたディレクトリ直下に新規フォルダを作成
try{
folderObj = Folder.selectDialog("加工元の画像が入っているフォルダを指定してください");
saveFolder= new Folder(folderObj + "/out");
saveFolder.create(); // フォルダ内作成先情報を設定しないと生成できない

// ループ総数を把握
fileList = folderObj.getFiles("*.jpg"); // getFilesは単一の拡張子しかマスクできない
alert("見つかった対象データ数：" +  fileList.length);

// カンバス拡張倍率をダイアログ入力
editObj = prompt("カンバス拡張倍率（画像の長辺を自動判定し、ここで指定した倍率で余白を追加します）を半角数字で指定してください","1.2");
alert("この倍率で塗り足し拡張します：" + editObj);

for (var i=0; i<fileList.length; i++){
    var file= fileList[i];
    open(file);
    var ad= app.activeDocument;
    var nameAll= ad.name;
    var reg= /(.*)(?:\.([^.]+$))/;
    nameAll= nameAll.match (reg)[1]; // データ名を拡張子前後で切り分けリスト格納
    var fName= nameAll.toLowerCase();
    // alert ("拡張子を削除して小文字に変換：　" + fName);
    ad.changeMode(ChangeMode.RGB); // カラーモード
    saveFor= new File ( saveFolder+ "/" + fName + ".jpg"); // データ新規作成先情報を設定しないと生成できない
    
    var x= ad.width;
    var y= ad.height;
    if(x>y){
        var orgSize= x;
    }else{
        var orgSize= y;
    }    

    if(301>orgSize){
        ad.resizeCanvas(orgSize*editObj,orgSize*editObj,AnchorPosition.MIDDLECENTER); // カンバス拡張
        ad.resizeImage (600, undefined, undefined, ResampleMethod.BICUBICSMOOTHER, 0); // 「バイキュービック補間に基づいて画像を拡大するための優れた方法」
        ad.saveAs (saveFor, jpgOpt_Low, true, Extension.LOWERCASE); // saveAs(保存先情報を持つファイルオブジェクト, JPEGSaveOptions, 複製を保存するかどうか, ファイル拡張子無し/大/小)
    }
    else{
      ad.resizeCanvas(orgSize*editObj,orgSize*editObj,AnchorPosition.MIDDLECENTER);
      ad.resizeImage (600, undefined, undefined, ResampleMethod.BICUBICSHARPER, 0); // 「シャープネスを強化したバイキュービック補間に基づいて画像のサイズを縮小するための優れた方法」
      ad.saveAs (saveFor, jpgOpt, true, Extension.LOWERCASE);
    }
    ad.close(SaveOptions.DONOTSAVECHANGES);
}

// 描画色・背景色を開始時の状態に戻す
app.foregroundColor= fgColor;
app.backgroundColor= bgColor;

alert (saveFolder + " 内に " + fileList.length + " 件のjpgが作成されました");

}catch( Error ){
    alert ("処理をキャンセルしました")
    }
