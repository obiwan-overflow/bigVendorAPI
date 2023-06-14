const express = require('express');
const { connect, sql,config } = require('./db');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const bodyParser = require("body-parser");
const { MAX } = require('mssql');
connect();
app.use(cors());
app.use(bodyParser.urlencoded({
  extended:true,
  limit: '10mb',
}));

app.get('/vendorUser/:id', (req, res) => {
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const id = req.params.id;
    const query = "SELECT * FROM dbo.db_vendor_user WHERE id_vendor_register = "+id+"";
    sql.query(query, (err, result) => {
      console.log(result);
      if (err) {
        console.log(err);
        return res.status(500).send('Error executing query');
      }
      res.send(result.recordset[0]);
    });
  });
});
app.get('/vendorRegister/:id', (req, res) => {
  const userId = req.params.id;
  const request = new sql.Request();
  request.input('PageNum', sql.Int, 1);
  request.input('PageSize', sql.Int, 10);
  request.input('id', sql.NVarChar(sql.MAX), userId);
  request.execute('SelectVendorRegister', (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error executing stored procedure');
    }
    if (result.recordset.length === 0) {
      return res.status(404).send('Register not found');
    }
    res.send(result.recordset[0]);
  });
});
app.get('/vendorRegister', (req, res) => {
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const pageNum = req.query.pageNum || 1;
    const pageSize = req.query.pageSize || 10;
    const query = `EXEC [dbo].[SelectVendorRegister] @PageNum = ${pageNum}, @PageSize = ${pageSize}`;
    sql.query(query, (err, result) => {
      console.log(result);
      if (err) {
        console.log(err);
        return res.status(500).send('Error executing query');
      }

      res.send(result.recordset);
    });
  });
});
app.post('/vendorRegister', (req, res) => {
  const { 
    email, 
    telephone, 
    fax, 
    genaralCompanyName,
    genaralCompanySince,
    genaralCompanyAddress,
    genaralCompanyTelephone,
    genaralCompanyFax,
    generalCompanyWebsite,
    generalCompanyTypeBusiness,
    generalManufactureProduct,
    genaralFileCatalog,
    genaralFileProfileCompany,
    generalEmployeeCount,
    generalEmployeePosition,
    generalEmployeeTemporary,
    generalEmployeeCount2,
    generalEmployeePosition2,
    generalEmployeeTemporary2,
    financialAccept,
    financialYear,
    financialRevenue,
    financialYear2,
    financialRevenue2,
    financialBank,
    financialBankBranch,
    financialBankAccount,
    financialBank2,
    financialBankBranch2,
    financialBankAccount2,
    financialCompany,
    financialCompanyContact,
    financialCompanyTelephone,
    financialCompany2,
    financialCompanyContact2,
    financialCompanyTelephone2,
    safetyIso9001,
    safetyIso14001,
    safetyGI,
    safetySafety,
    safetyRecord,
    safetyHoliday,
  } = req.body;
  const values = [
    email, 
    telephone, 
    fax, 
    genaralCompanyName,
    genaralCompanySince,
    genaralCompanyAddress,
    genaralCompanyTelephone,
    genaralCompanyFax,
    generalCompanyWebsite,
    generalCompanyTypeBusiness,
    generalManufactureProduct,
    genaralFileCatalog,
    genaralFileProfileCompany,
    generalEmployeeCount,
    generalEmployeePosition,
    generalEmployeeTemporary,
    generalEmployeeCount2,
    generalEmployeePosition2,
    generalEmployeeTemporary2,
    financialAccept,
    financialYear,
    financialRevenue,
    financialYear2,
    financialRevenue2,
    financialBank,
    financialBankBranch,
    financialBankAccount,
    financialBank2,
    financialBankBranch2,
    financialBankAccount2,
    financialCompany,
    financialCompanyContact,
    financialCompanyTelephone,
    financialCompany2,
    financialCompanyContact2,
    financialCompanyTelephone2,
    safetyIso9001,
    safetyIso14001,
    safetyGI,
    safetySafety,
    safetyRecord,
    safetyHoliday,
  ];
  // const now = new Date();
  // const datetime = now.toISOString();
  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
      .input('status', sql.Int, 0)
      .input('email', sql.NVarChar(255), email)
      .input('telephone', sql.NVarChar(10), telephone)
      .input('fax', sql.NVarChar(10), fax)
      .input('genaralCompanyName', sql.NVarChar(255), genaralCompanyName)
      .input('genaralCompanySince', sql.NVarChar(255), genaralCompanySince)
      .input('genaralCompanyAddress', sql.NVarChar(255), genaralCompanyAddress)
      .input('genaralCompanyTelephone', sql.NVarChar(255), genaralCompanyTelephone)
      .input('genaralCompanyFax', sql.NVarChar(255), genaralCompanyFax)
      .input('generalCompanyWebsite', sql.NVarChar(255), generalCompanyWebsite)
      .input('generalCompanyTypeBusiness', sql.NVarChar(255), generalCompanyTypeBusiness)
      .input('generalManufactureProduct', sql.NVarChar(255), generalManufactureProduct)
      .input('generalEmployeeCount', sql.NVarChar(255), generalEmployeeCount)
      .input('generalEmployeePosition', sql.NVarChar(255), generalEmployeePosition)
      .input('generalEmployeeTemporary', sql.NVarChar(255), generalEmployeeTemporary)
      .input('generalEmployeeCount2', sql.NVarChar(255), generalEmployeeCount2)
      .input('generalEmployeePosition2', sql.NVarChar(255), generalEmployeePosition2)
      .input('generalEmployeeTemporary2', sql.NVarChar(255), generalEmployeeTemporary2)
      .input('financialAccept', sql.NVarChar(255), financialAccept)
      .input('financialYear', sql.NVarChar(255), financialYear)
      .input('financialRevenue', sql.NVarChar(255), financialRevenue)
      .input('financialYear2', sql.NVarChar(255), financialYear2)
      .input('financialRevenue2', sql.NVarChar(255), financialRevenue2)
      .input('financialBank', sql.NVarChar(255), financialBank)
      .input('financialBankBranch', sql.NVarChar(255), financialBankBranch)
      .input('financialBankAccount', sql.NVarChar(255), financialBankAccount)
      .input('financialBank2', sql.NVarChar(255), financialBank2)
      .input('financialBankBranch2', sql.NVarChar(255), financialBankBranch2)
      .input('financialBankAccount2', sql.NVarChar(255), financialBankAccount2)
      .input('financialCompany', sql.NVarChar(255), financialCompany)
      .input('financialCompanyContact', sql.NVarChar(255), financialCompanyContact)
      .input('financialCompanyTelephone', sql.NVarChar(255), financialCompanyTelephone)
      .input('financialCompany2', sql.NVarChar(255), financialCompany2)
      .input('financialCompanyContact2', sql.NVarChar(255), financialCompanyContact2)
      .input('financialCompanyTelephone2', sql.NVarChar(255), financialCompanyTelephone2)
      .input('safetyIso9001', sql.NVarChar(255), safetyIso9001)
      .input('safetyIso14001', sql.NVarChar(255), safetyIso14001)
      .input('safetyGI', sql.NVarChar(255), safetyGI)
      .input('safetySafety', sql.NVarChar(255), safetySafety)
      .input('safetyRecord', sql.NVarChar(255), safetyRecord)
      .input('safetyHoliday', sql.NVarChar(255), safetyHoliday)
      .input('date_add', sql.DateTime, new Date())
      .input('del', sql.Int, 0)
      .input('file_catalog', sql.NText, genaralFileCatalog)
      .input('file_profile_company', sql.NText, genaralFileProfileCompany)
      .output('message', sql.NVarChar(50))
      .execute('AddVendorRegister', function(err, returnValue) {
        if (err){
          const errorResult = {
            code: 'E0001',
            message: err
          };
          res.status(500).json({
            success: false,
            error: errorResult
          });
        }
        console.log(returnValue);
        message = returnValue.output.message;
        res.status(200).json({
          success: true,
          message: message,
          data: values
        });
    });
  } catch (error) {
      const errorResult = {
        code: 'E0001',
        message: 'An error occurred while retrieving data'
      };
      res.status(500).json({
        success: false,
        error: errorResult
      });
  }
});
app.put('/vendorRegisterFile/:id', (req, res) => {
  const { status, file_20, file_company_certificate, file_bookbank, file_transfer } = req.body;
  const values = [ status, file_20, file_company_certificate, file_bookbank, file_transfer ];
  const id = req.params.id;
  // const datetime = now.toISOString();
  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
      .input('id', sql.Int, id)
      .input('status', sql.Int, status)
      .input('file_20', sql.Text, file_20)
      .input('file_company_certificate', sql.Text, file_company_certificate)
      .input('file_bookbank', sql.Text, file_bookbank)
      .input('file_transfer', sql.Text, file_transfer)
      .output('message', sql.NVarChar(50))
      .execute('UpdateVendorRegister', function(err, returnValue) {
        if (err){
          const errorResult = {
            code: 'E0001',
            message: err
          };
          res.status(500).json({
            success: false,
            error: errorResult
          });
        }
        console.log(returnValue);
        message = returnValue.output.message;
        res.status(200).json({
          success: true,
          message: message,
          data: values
        });
    });
  } catch (error) {
      const errorResult = {
        code: 'E0001',
        message: 'An error occurred while retrieving data'
      };
      res.status(500).json({
        success: false,
        error: errorResult
      });
  }
});

app.post('/vendorRegisterPerson', (req, res) => {
  const {register_id, person_name, person_telephone, person_email, person_position} = req.body;
  const values = [register_id, person_name, person_telephone, person_email, person_position];
  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
      .input('register_id', sql.Int, register_id)
      .input('person_name', sql.NVarChar(255), person_name)
      .input('person_telephone', sql.NVarChar(10), person_telephone)
      .input('person_email', sql.NVarChar(255), person_email)
      .input('person_position', sql.NVarChar(255), person_position)
      .output('message', sql.NVarChar(50))
      .execute('AddVendorRegisterPerson', function(err, returnValue) {
        if (err){
          const errorResult = {
            code: 'E0001',
            message: err
          };
          res.status(500).json({
            success: false,
            error: errorResult
          });
        }
        console.log(returnValue);
        message = returnValue.output.message;
        res.status(200).json({
          success: true,
          message: message,
          data: values
        });
    });
  } catch (error) {
      const errorResult = {
        code: 'E0001',
        message: 'An error occurred while retrieving data'
      };
      res.status(500).json({
        success: false,
        error: errorResult
      });
  }
});
app.get('/vendorRegisterPerson/:id', (req, res) => {
  const registerId = req.params.id;
  const request = new sql.Request();
  request.input('register_id', sql.NVarChar(sql.MAX), registerId);
  request.execute('SelectVendorRegisterPerson', (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error executing stored procedure');
    }
    if (result.recordset.length === 0) {
      return res.status(404).send('Register not found');
    }
    res.send(result.recordset);
  });
});


app.post('/vendorRegisterProducts', (req, res) => {
  const {register_id, type, description, brand} = req.body;
  const values = [register_id, type, description, brand];
  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
      .input('register_id', sql.Int, register_id)
      .input('type', sql.NVarChar(255), type)
      .input('description', sql.NVarChar(MAX), description)
      .input('brand', sql.NVarChar(255), brand)
      .output('message', sql.NVarChar(50))
      .execute('AddVendorRegisterProducts', function(err, returnValue) {
        if (err){
          const errorResult = {
            code: 'E0001',
            message: err
          };
          res.status(500).json({
            success: false,
            error: errorResult
          });
        }
        console.log(returnValue);
        message = returnValue.output.message;
        res.status(200).json({
          success: true,
          message: message,
          data: values
        });
    });
  } catch (error) {
      const errorResult = {
        code: 'E0001',
        message: 'An error occurred while retrieving data'
      };
      res.status(500).json({
        success: false,
        error: errorResult
      });
  }
});
app.get('/vendorRegisterProducts/:id', (req, res) => {
  const registerId = req.params.id;
  const request = new sql.Request();
  request.input('register_id', sql.NVarChar(sql.MAX), registerId);
  request.execute('SelectVendorRegisterProducts', (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error executing stored procedure');
    }
    if (result.recordset.length === 0) {
      return res.status(404).send('Register not found');
    }
    res.send(result.recordset);
  });
});


app.post('/vendorRegisterServices', (req, res) => {
  const {register_id, cat_id, subcat_id, service_id, description} = req.body;
  const values = [register_id, cat_id, subcat_id, service_id, description];
  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
      .input('register_id', sql.Int, register_id)
      .input('cat_id', sql.Int, cat_id)
      .input('subcat_id', sql.Int, subcat_id)
      .input('service_id', sql.Int, service_id)
      .input('description', sql.NVarChar(MAX), description)
      .output('message', sql.NVarChar(50))
      .execute('AddVendorRegisterService', function(err, returnValue) {
        if (err){
          const errorResult = {
            code: 'E0001',
            message: err
          };
          res.status(500).json({
            success: false,
            error: errorResult
          });
        }
        console.log(returnValue);
        message = returnValue.output.message;
        res.status(200).json({
          success: true,
          message: message,
          data: values
        });
    });
  } catch (error) {
      const errorResult = {
        code: 'E0001',
        message: 'An error occurred while retrieving data'
      };
      res.status(500).json({
        success: false,
        error: errorResult
      });
  }
});


// vendor form get service
app.get('/vendorServiceCat', (req, res) =>{
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const query = "SELECT * FROM dbo.db_vendor_service_cat WHERE del = 0";
    sql.query(query, (err, result) => {
      console.log(result);
      if (err) {
        console.log(err);
        return res.status(500).send('Error executing query');
      }
      res.send(result.recordset);
    });
  });
});
app.get('/vendorServiceSubcat/:id', (req, res) =>{
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const id = req.params.id;
    const query = "SELECT * FROM dbo.db_vendor_service_subcat WHERE cat_id = "+id+"";
    sql.query(query, (err, result) => {
      console.log(result);
      if (err) {
        console.log(err);
        return res.status(500).send('Error executing query');
      }
      res.send(result.recordset);
    });
  });
});
app.get('/vendorServiceLists/:id', (req, res) =>{
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const id = req.params.id;
    const query = "SELECT * FROM dbo.db_vendor_service WHERE subcat_id = "+id+"";
    sql.query(query, (err, result) => {
      console.log(result);
      if (err) {
        console.log(err);
        return res.status(500).send('Error executing query');
      }
      res.send(result.recordset);
    });
  });
});

// SignIn
// app.post('/vendorSignin', (req, res) => {
//   sql.connect(config, err => {
//     if (err) {
//       console.log(err);
//       return res.status(500).send('Error connecting to database');
//     }
//     const username = req.body.username;
//     const password = req.body.password;
//     const query = "SELECT * FROM dbo.db_vendor_user WHERE username = "+username+" AND password = "+password+"";
//     sql.query(query, (err, result) => {
//       console.log(result);
//       if (err) {
//         console.log(err);
//         return res.status(500).send('Error executing query');
//       }
//       if (!result) {
//         res.status(401).send('ชื่อผู้ใช้ไม่ถูกต้อง');
//         return;
//       }
//       res.send(result.recordset);
//     });
//   });
// });
app.post('/vendorSignin', async (req, res) => {
  const {username, password} = req.body;
  try {
    await sql.connect(config);
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input('username', sql.NVarChar(255), username)
      .input('password', sql.NVarChar(255), password)
      .query('SELECT * FROM dbo.db_vendor_user WHERE username = @username AND password = @password');

    if (result.recordset.length === 0) {
      return res.status(401).send('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
    const user = result.recordset[0];

    return res.status(200).json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      data: {
        id: user.id,
        username: user.username,
        id_vendor_register: user.id_vendor_register
        // เพิ่มข้อมูลอื่นๆที่คุณต้องการส่งกลับ
      }
    });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล:', error);
    return res.status(500).send('เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล');
  }
});


// backend generate 
app.post('/generateVendorUser', (req, res) => {
  const {id_vendor_register, username, password, name} = req.body;
  const values = [id_vendor_register, username, password, name];
  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
      .input('id_vendor_register', sql.Int, id_vendor_register)
      .input('username', sql.NVarChar(255), username)
      .input('password', sql.NVarChar(255), password)
      .input('name', sql.NVarChar(255), name)
      .output('message', sql.NVarChar(50))
      .execute('GenerateVendorUser', function(err, returnValue) {
        if (err){
          const errorResult = {
            code: 'E0001',
            message: err
          };
          res.status(500).json({
            success: false,
            error: errorResult
          });
        }
        console.log(returnValue);
        message = returnValue.output.message;
        res.status(200).json({
          success: true,
          message: message,
          data: values
        });
    });
  } catch (error) {
      const errorResult = {
        code: 'E0001',
        message: 'An error occurred while retrieving data'
      };
      res.status(500).json({
        success: false,
        error: errorResult
      });
  }
});
app.get('/selectUserFormRegister/:id', (req, res) =>{
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const id = req.params.id;
    const query = "SELECT * FROM dbo.db_vendor_user WHERE id_vendor_register = "+id+"";
    sql.query(query, (err, result) => {
      console.log(result);
      if (err) {
        console.log(err);
        return res.status(500).send('Error executing query');
      }
      res.send(result.recordset);
    });
  });
});





// upload file
app.get('/images/:filename', (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, 'uploads', filename);
  res.sendFile(imagePath);
});

app.post('/saveImage', (req, res) => {
  const base64Image = req.body.image;
  const fileType = req.body.fileType;
  
  // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
  
  // Generate a unique filename with appropriate extension
  const fileExtension = getFileExtension(fileType);
  const fileName = generateUniqueFileName(fileExtension);
  
  // Save the base64 image to a file
  fs.writeFile(path.join('uploads', `${fileName}.${fileExtension}`), base64Data, 'base64', (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error saving image.');
    } else {
      console.log(`Image saved as ${fileName}.${fileExtension}`);
      // res.send('Image saved successfully.');
      const jsonResponse = {
        fileName: fileName,
        fileExtension: fileExtension
      };
  
      res.json(jsonResponse);
    }
  });
});

// Generate a unique filename (you can implement your own logic)
function generateUniqueFileName(extension) {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 1000);
  return `image_${timestamp}_${randomNum}`;
}

// Get the file extension based on the fileType
function getFileExtension(fileType) {
  switch (fileType) {
    case 'image/jpeg':
      return 'jpeg';
    case 'image/png':
      return 'png';
    case 'application/pdf':
      return 'pdf';
    // Add more cases for other supported file types
    default:
      return 'jpg'; // Default to JPEG extension if file type is unknown
  }
}


app.listen(3003, () => {
  console.log('Server started on port 3003');
});