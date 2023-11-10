const express = require('express');
const { connect, sql,config } = require('./db');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
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
  // const userId = req.params.id;
  // const request = new sql.Request();
  // request.input('PageNum', sql.Int, 1);
  // request.input('PageSize', sql.Int, 10);
  // request.input('id', sql.NVarChar(sql.MAX), userId);
  // request.execute('SelectVendorRegister', (err, result) => {
  //   if (err) {
  //     console.log(err);
  //     return res.status(500).send('Error executing stored procedure');
  //   }
  //   if (result.recordset.length === 0) {
  //     return res.status(404).send('Register not found');
  //   }
  //   res.send(result.recordset[0]);
  // });
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const id = req.params.id;
    const query = 'select * from dbo.db_vendor_register where id = '+id+'';
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
app.get('/vendorRegister', (req, res) => {
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    // const pageNum = req.query.pageNum || 1;
    // const pageSize = req.query.pageSize || 10;
    // const query = `EXEC [dbo].[SelectVendorRegister] @PageNum = ${pageNum}, @PageSize = ${pageSize}`;
    const query = 'select * from dbo.db_vendor_register where del = 0 and status != 3 order by id desc';
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
app.get('/vendorRegisterStatus/:status', (req, res) => {
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const status = req.params.status;
    const query = 'SELECT * FROM db_vendor_register WHERE status = '+status+' and del = 0 and vendor_code is not null';
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
app.get('/vendorRegisterStatusAll', (req, res) => {
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const status = req.params.status;
    const query = 'SELECT * FROM db_vendor_register WHERE status = 3 and vendor_code is null and del = 0';
    sql.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error executing query');
      }
      res.send(result.recordset);
    });
  });
});

app.post('/vendorRegisterEquipment', (req, res) =>{
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const pBusiness = req.body.pBusiness;
    const pPackage = req.body.pPackage;
    const pEquipment_group = req.body.pEquipment_group;
    const pEquipment_lists = req.body.pEquipment_lists;

    let where = '';
    if (pBusiness) {
      where += "AND b.business_section = '" + pBusiness + "' ";
    }
    if (pPackage) {
      where += "AND b.package = '" + pPackage + "' ";
    }
    if (pEquipment_group) {
      where += "AND b.equipment_group = '" + pEquipment_group + "' ";
    }
    if (pEquipment_lists) {
      where += "AND b.equipment_lists = '" + pEquipment_lists + "' ";
    }

    const query = `
      SELECT a.id as id,b.business_section as business_section,b.package as package,b.equipment_group as equipment_group,
      b.equipment_lists as equipment_lists,b.brand as brand,a.vendor_code as vendor_code
      FROM dbo.db_vendor_register a 
      LEFT JOIN dbo.db_vendor_register_products b ON a.id = b.register_id 
      WHERE a.del = 0 AND vendor_code is not null AND a.status = 3 ${where} AND (a.generalCompanyTypeBusiness = 1 OR a.generalCompanyTypeBusiness = 3)
    `;
    // const query = 'SELECT * FROM db_vendor_register WHERE del = 0 AND status = 3 AND generalCompanyTypeBusiness = 1 OR generalCompanyTypeBusiness = 3';
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
app.post('/vendorRegisterByService', (req, res) =>{
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const sCat = req.body.sCat;
    const sSubcat = req.body.sSubcat;
    const sService = req.body.sService;


    let where = '';
    if (sCat) {
      where += "AND b.cat_id = '" + sCat + "' ";
    }
    if (sSubcat) {
      where += "AND b.subcat_id = '" + sSubcat + "' ";
    }
    if (sService) {
      where += "AND b.service_id = '" + sService + "' ";
    }


    // const query = `
    //   SELECT * 
    //   FROM dbo.db_vendor_register a 
    //   LEFT JOIN dbo.db_vendor_register_services b ON a.id = b.register_id 
    //   WHERE a.del = 0 AND vendor_code is not null AND a.status = 3 ${where} AND (a.generalCompanyTypeBusiness = 2 OR a.generalCompanyTypeBusiness = 3)
    // `;
    const query = `
      SELECT a.id as id,c.cat_name as cat_name,d.subcat_name as subcat_name,e.service_name as service_name,b.description as description 
      FROM dbo.db_vendor_register a 
      LEFT JOIN dbo.db_vendor_register_services b ON a.id = b.register_id 
      LEFT JOIN dbo.db_vendor_service_cat c ON b.cat_id = c.cat_id
      LEFT JOIN dbo.db_vendor_service_subcat d ON b.subcat_id = d.subcat_id
      LEFT JOIN dbo.db_vendor_service e ON b.service_id = e.service_id
      WHERE a.del = 0 AND vendor_code is not null AND a.status = 3 ${where} AND (a.generalCompanyTypeBusiness = 2 OR a.generalCompanyTypeBusiness = 3)
    `;
    // const query = 'SELECT * FROM db_vendor_register WHERE del = 0 AND status = 3 AND generalCompanyTypeBusiness = 2 OR generalCompanyTypeBusiness = 3';
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
app.delete('/vendorRegister/:id', (req, res) =>{
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const id = req.params.id;
    const query = "UPDATE db_vendor_register SET del = 1 WHERE id = '" + id + "'";
    sql.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error executing query');
      }
      res.json({ message: 'Update successful' });
    });
  });
});
app.post('/vendorRegister', (req, res) => {
  const { email, telephone, fax, genaralCompanyName,genaralCompanySince,genaralCompanyAddress,genaralCompanyTelephone,genaralCompanyFax,generalCompanyWebsite,generalCompanyTypeBusiness,generalManufactureProduct,genaralFileCatalog,genaralFileProfileCompany,generalEmployeeCount,generalEmployeePosition,generalEmployeeTemporary,generalEmployeeCount2,generalEmployeePosition2,generalEmployeeTemporary2,financialAccept,financialYear,financialRevenue,financialYear2,financialRevenue2,financialBank,financialBankBranch,financialBankAccount,financialBank2,financialBankBranch2,financialBankAccount2,financialCompany,financialCompanyContact,financialCompanyTelephone,financialCompany2,financialCompanyContact2,financialCompanyTelephone2,safetyIso9001,safetyIso14001,safetyGI,safetySafety,safetyRecord,safetyHoliday,information_provider,information_position,information_date,vendor_code} = req.body;
  const values = [email, telephone, fax, genaralCompanyName,genaralCompanySince,genaralCompanyAddress,genaralCompanyTelephone,genaralCompanyFax,generalCompanyWebsite,generalCompanyTypeBusiness,generalManufactureProduct,genaralFileCatalog,genaralFileProfileCompany,generalEmployeeCount,generalEmployeePosition,generalEmployeeTemporary,generalEmployeeCount2,generalEmployeePosition2,generalEmployeeTemporary2,financialAccept,financialYear,financialRevenue,financialYear2,financialRevenue2,financialBank,financialBankBranch,financialBankAccount,financialBank2,financialBankBranch2,financialBankAccount2,financialCompany,financialCompanyContact,financialCompanyTelephone,financialCompany2,financialCompanyContact2,financialCompanyTelephone2,safetyIso9001,safetyIso14001,safetyGI,safetySafety,safetyRecord,safetyHoliday,information_provider,information_position,information_date,vendor_code];
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
      .input('telephone', sql.NVarChar(10), telephone.substring(0,10))
      .input('fax', sql.NVarChar(10), fax.substring(0,10))
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
      .input('information_provider', sql.NVarChar(50), information_provider)
      .input('information_position', sql.NVarChar(50), information_position)
      .input('information_date', sql.DateTime, information_date)
      .input('del', sql.Int, 0)
      .input('file_catalog', sql.NVarChar(255), genaralFileCatalog)
      .input('file_profile_company', sql.NVarChar(255), genaralFileProfileCompany)
      .input('vendor_code', sql.NVarChar(30), vendor_code)
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
app.put('/vendorRegister/:id', (req, res) => {
  const { status, email, telephone, fax, genaralCompanyName,genaralCompanySince,genaralCompanyAddress,genaralCompanyTelephone,genaralCompanyFax,generalCompanyWebsite,generalCompanyTypeBusiness,generalManufactureProduct,genaralFileCatalog,genaralFileProfileCompany,generalEmployeeCount,generalEmployeePosition,generalEmployeeTemporary,generalEmployeeCount2,generalEmployeePosition2,generalEmployeeTemporary2,financialAccept,financialYear,financialRevenue,financialYear2,financialRevenue2,financialBank,financialBankBranch,financialBankAccount,financialBank2,financialBankBranch2,financialBankAccount2,financialCompany,financialCompanyContact,financialCompanyTelephone,financialCompany2,financialCompanyContact2,financialCompanyTelephone2,safetyIso9001,safetyIso14001,safetyGI,safetySafety,safetyRecord,safetyHoliday,vendor_code} = req.body;
  const values = [status, email, telephone, fax, genaralCompanyName,genaralCompanySince,genaralCompanyAddress,genaralCompanyTelephone,genaralCompanyFax,generalCompanyWebsite,generalCompanyTypeBusiness,generalManufactureProduct,genaralFileCatalog,genaralFileProfileCompany,generalEmployeeCount,generalEmployeePosition,generalEmployeeTemporary,generalEmployeeCount2,generalEmployeePosition2,generalEmployeeTemporary2,financialAccept,financialYear,financialRevenue,financialYear2,financialRevenue2,financialBank,financialBankBranch,financialBankAccount,financialBank2,financialBankBranch2,financialBankAccount2,financialCompany,financialCompanyContact,financialCompanyTelephone,financialCompany2,financialCompanyContact2,financialCompanyTelephone2,safetyIso9001,safetyIso14001,safetyGI,safetySafety,safetyRecord,safetyHoliday,vendor_code];
  // const now = new Date();
  // const datetime = now.toISOString();
  const id = req.params.id;
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
      .input('file_catalog', sql.NVarChar(255), genaralFileCatalog)
      .input('file_profile_company', sql.NVarChar(255), genaralFileProfileCompany)
      .input('vendor_code', sql.NVarChar(30), vendor_code)
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
      .input('file_20', sql.NVarChar(255), file_20)
      .input('file_company_certificate', sql.NVarChar(255), file_company_certificate)
      .input('file_bookbank', sql.NVarChar(255), file_bookbank)
      .input('file_transfer', sql.NVarChar(255), file_transfer)
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
      .input('person_telephone', sql.NVarChar(10), person_telephone.substring(0,10))
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
app.delete('/vendorRegisterPerson/:id', (req, res) => {
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const id = req.params.id;
    const query = "DELETE FROM db_vendor_register_person where register_id = '"+ id +"'";
    sql.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error executing query');
      }
      console.log(result)
      res.send(result.recordset);
    });
  });
});

app.post('/vendorRegisterProducts', (req, res) => {
  const {register_id, type, description, brand, business_section, package, equipment_group, equipment_lists} = req.body;
  const values = [register_id, type, description, brand, business_section, package, equipment_group, equipment_lists];
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
      .input('business_section', sql.NVarChar(255), business_section)
      .input('package', sql.NVarChar(255), package)
      .input('equipment_group', sql.NVarChar(255), equipment_group)
      .input('equipment_lists', sql.NVarChar(255), equipment_lists)
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
app.delete('/vendorRegisterProducts/:id', (req, res) => {
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const id = req.params.id;
    const query = "DELETE FROM db_vendor_register_products where register_id = '"+ id +"'";
    sql.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error executing query');
      }
      console.log(result)
      res.send(result.recordset);
    });
  });
});
app.get('/vendorRegisterServices/:id', (req, res) => {
  const registerId = req.params.id;
  const request = new sql.Request();
  request.input('register_id', sql.NVarChar(sql.MAX), registerId);
  request.execute('SelectVendorRegisterServices', (err, result) => {
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
app.delete('/vendorRegisterServices/:id', (req, res) => {
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const id = req.params.id;
    const query = "DELETE FROM db_vendor_register_services where register_id = '"+ id +"'";
    sql.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error executing query');
      }
      console.log(result)
      res.send(result.recordset);
    });
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
app.get('/vendorRegisterEvaluate/:id', (req, res) => {
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const id = req.params.id;
    const query = "SELECT * FROM db_vendor_register_evaluate WHERE id_vendor_register = "+id+"";
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
app.post('/vendorRegisterEvaluate', (req, res) => {
  const { id_vendor_register,information_provider,information_position,date,score_1_1,seller_1_1,contractor_1_1,score_1_2,seller_1_2,contractor_1_2,score_1_3,seller_1_3,contractor_1_3,score_2_1,seller_2_1,contractor_2_1,score_2_2,seller_2_2,contractor_2_2,score_2_3,seller_2_3,contractor_2_3,score_3_1,seller_3_1,contractor_3_1,score_3_2,seller_3_2,contractor_3_2,score_3_3,seller_3_3,contractor_3_3,score_4_1,seller_4_1,contractor_4_1,score_4_2,seller_4_2,contractor_4_2,score_4_3,seller_4_3,contractor_4_3,score_5_1,seller_5_1,contractor_5_1,score_5_2,seller_5_2,contractor_5_2,score_6_1,score_6_2,score_6_3,score_7_1,score_7_2,score_7_3,score_8_1,score_8_2,score_8_3,assessor,date_evaluate,assessment_summary,comment1,comment1_date,comment2,comment2_date,comment3,comment3_date,desc_1,desc_2,desc_3,desc_4,desc_5,desc_6,desc_7,desc_8 } = req.body;
  const values = [ id_vendor_register,information_provider,information_position,date,score_1_1,seller_1_1,contractor_1_1,score_1_2,seller_1_2,contractor_1_2,score_1_3,seller_1_3,contractor_1_3,score_2_1,seller_2_1,contractor_2_1,score_2_2,seller_2_2,contractor_2_2,score_2_3,seller_2_3,contractor_2_3,score_3_1,seller_3_1,contractor_3_1,score_3_2,seller_3_2,contractor_3_2,score_3_3,seller_3_3,contractor_3_3,score_4_1,seller_4_1,contractor_4_1,score_4_2,seller_4_2,contractor_4_2,score_4_3,seller_4_3,contractor_4_3,score_5_1,seller_5_1,contractor_5_1,score_5_2,seller_5_2,contractor_5_2,score_6_1,score_6_2,score_6_3,score_7_1,score_7_2,score_7_3,score_8_1,score_8_2,score_8_3,assessor,date_evaluate,assessment_summary,comment1,comment1_date,comment2,comment2_date,comment3,comment3_date,desc_1,desc_2,desc_3,desc_4,desc_5,desc_6,desc_7,desc_8 ];
  
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
      .input('information_provider', sql.NVarChar(100), information_provider)
      .input('information_position', sql.NVarChar(100), information_position)
      .input('date', sql.DateTime, date)
      .input('score_1_1', sql.NVarChar(50), score_1_1)
      .input('seller_1_1', sql.NVarChar(50), seller_1_1)
      .input('contractor_1_1', sql.NVarChar(50), contractor_1_1)
      .input('score_1_2', sql.NVarChar(50), score_1_2)
      .input('seller_1_2', sql.NVarChar(50), seller_1_2)
      .input('contractor_1_2', sql.NVarChar(50), contractor_1_2)
      .input('score_1_3', sql.NVarChar(50), score_1_3)
      .input('seller_1_3', sql.NVarChar(50), seller_1_3)
      .input('contractor_1_3', sql.NVarChar(50), contractor_1_3)
      .input('score_2_1', sql.NVarChar(50), score_2_1)
      .input('seller_2_1', sql.NVarChar(50), seller_2_1)
      .input('contractor_2_1', sql.NVarChar(50), contractor_2_1)
      .input('score_2_2', sql.NVarChar(50), score_2_2)
      .input('seller_2_2', sql.NVarChar(50), seller_2_2)
      .input('contractor_2_2', sql.NVarChar(50), contractor_2_2)
      .input('score_2_3', sql.NVarChar(50), score_2_3)
      .input('seller_2_3', sql.NVarChar(50), seller_2_3)
      .input('contractor_2_3', sql.NVarChar(50), contractor_2_3)
      .input('score_3_1', sql.NVarChar(50), score_3_1)
      .input('seller_3_1', sql.NVarChar(50), seller_3_1)
      .input('contractor_3_1', sql.NVarChar(50), contractor_3_1)
      .input('score_3_2', sql.NVarChar(50), score_3_2)
      .input('seller_3_2', sql.NVarChar(50), seller_3_2)
      .input('contractor_3_2', sql.NVarChar(50), contractor_3_2)
      .input('score_3_3', sql.NVarChar(50), score_3_3)
      .input('seller_3_3', sql.NVarChar(50), seller_3_3)
      .input('contractor_3_3', sql.NVarChar(50), contractor_3_3)
      .input('score_4_1', sql.NVarChar(50), score_4_1)
      .input('seller_4_1', sql.NVarChar(50), seller_4_1)
      .input('contractor_4_1', sql.NVarChar(50), contractor_4_1)
      .input('score_4_2', sql.NVarChar(50), score_4_2)
      .input('seller_4_2', sql.NVarChar(50), seller_4_2)
      .input('contractor_4_2', sql.NVarChar(50), contractor_4_2)
      .input('score_4_3', sql.NVarChar(50), score_4_3)
      .input('seller_4_3', sql.NVarChar(50), seller_4_3)
      .input('contractor_4_3', sql.NVarChar(50), contractor_4_3)
      .input('score_5_1', sql.NVarChar(50), score_5_1)
      .input('seller_5_1', sql.NVarChar(50), seller_5_1)
      .input('contractor_5_1', sql.NVarChar(50), contractor_5_1)
      .input('score_5_2', sql.NVarChar(50), score_5_2)
      .input('seller_5_2', sql.NVarChar(50), seller_5_2)
      .input('contractor_5_2', sql.NVarChar(50), contractor_5_2)
      .input('score_6_1', sql.NVarChar(50), score_6_1)
      .input('score_6_2', sql.NVarChar(50), score_6_2)
      .input('score_6_3', sql.NVarChar(50), score_6_3)
      .input('score_7_1', sql.NVarChar(50), score_7_1)
      .input('score_7_2', sql.NVarChar(50), score_7_2)
      .input('score_7_3', sql.NVarChar(50), score_7_3)
      .input('score_8_1', sql.NVarChar(50), score_8_1)
      .input('score_8_2', sql.NVarChar(50), score_8_2)
      .input('score_8_3', sql.NVarChar(50), score_8_3)
      .input('assessor', sql.NVarChar(50), assessor)
      .input('date_evaluate', sql.DateTime, date_evaluate)
      .input('assessment_summary', sql.NVarChar(25), assessment_summary)
      .input('comment1', sql.NVarChar(50), comment1)
      .input('comment1_date', sql.DateTime, comment1_date)
      .input('comment2', sql.NVarChar(50), comment2)
      .input('comment2_date', sql.DateTime, comment2_date)
      .input('comment3', sql.NVarChar(50), comment3)
      .input('comment3_date', sql.DateTime, comment3_date)
      .input('desc_1', sql.NVarChar(10), desc_1)
      .input('desc_2', sql.NVarChar(10), desc_2)
      .input('desc_3', sql.NVarChar(10), desc_3)
      .input('desc_4', sql.NVarChar(10), desc_4)
      .input('desc_5', sql.NVarChar(10), desc_5)
      .input('desc_6', sql.NVarChar(10), desc_6)
      .input('desc_7', sql.NVarChar(10), desc_7)
      .input('desc_8', sql.NVarChar(10), desc_8)
      .output('message', sql.NVarChar(50))
      .execute('AddVendorRegisterEvaluate', function(err, returnValue) {
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
        message = returnValue.output.message;
        res.status(200).json({
          success: true,
          message: message
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
app.put('/vendorRegisterEvaluate/:id', (req, res) => {
  const { id_vendor_register,information_provider,information_position,date,score_1_1,seller_1_1,contractor_1_1,score_1_2,seller_1_2,contractor_1_2,score_1_3,seller_1_3,contractor_1_3,score_2_1,seller_2_1,contractor_2_1,score_2_2,seller_2_2,contractor_2_2,score_2_3,seller_2_3,contractor_2_3,score_3_1,seller_3_1,contractor_3_1,score_3_2,seller_3_2,contractor_3_2,score_3_3,seller_3_3,contractor_3_3,score_4_1,seller_4_1,contractor_4_1,score_4_2,seller_4_2,contractor_4_2,score_4_3,seller_4_3,contractor_4_3,score_5_1,seller_5_1,contractor_5_1,score_5_2,seller_5_2,contractor_5_2,score_6_1,score_6_2,score_6_3,score_7_1,score_7_2,score_7_3,score_8_1,score_8_2,score_8_3,assessor,date_evaluate,assessment_summary,comment1,comment1_date,comment2,comment2_date,comment3,comment3_date,desc_1,desc_2,desc_3,desc_4,desc_5,desc_6,desc_7,desc_8 } = req.body;
  const values = [ id_vendor_register,information_provider,information_position,date,score_1_1,seller_1_1,contractor_1_1,score_1_2,seller_1_2,contractor_1_2,score_1_3,seller_1_3,contractor_1_3,score_2_1,seller_2_1,contractor_2_1,score_2_2,seller_2_2,contractor_2_2,score_2_3,seller_2_3,contractor_2_3,score_3_1,seller_3_1,contractor_3_1,score_3_2,seller_3_2,contractor_3_2,score_3_3,seller_3_3,contractor_3_3,score_4_1,seller_4_1,contractor_4_1,score_4_2,seller_4_2,contractor_4_2,score_4_3,seller_4_3,contractor_4_3,score_5_1,seller_5_1,contractor_5_1,score_5_2,seller_5_2,contractor_5_2,score_6_1,score_6_2,score_6_3,score_7_1,score_7_2,score_7_3,score_8_1,score_8_2,score_8_3,assessor,date_evaluate,assessment_summary,comment1,comment1_date,comment2,comment2_date,comment3,comment3_date,desc_1,desc_2,desc_3,desc_4,desc_5,desc_6,desc_7,desc_8 ];
  const id = req.params.id;
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
      .input('information_provider', sql.NVarChar(100), information_provider)
      .input('information_position', sql.NVarChar(100), information_position)
      .input('date', sql.DateTime, date)
      .input('score_1_1', sql.NVarChar(50), score_1_1)
      .input('seller_1_1', sql.NVarChar(50), seller_1_1)
      .input('contractor_1_1', sql.NVarChar(50), contractor_1_1)
      .input('score_1_2', sql.NVarChar(50), score_1_2)
      .input('seller_1_2', sql.NVarChar(50), seller_1_2)
      .input('contractor_1_2', sql.NVarChar(50), contractor_1_2)
      .input('score_1_3', sql.NVarChar(50), score_1_3)
      .input('seller_1_3', sql.NVarChar(50), seller_1_3)
      .input('contractor_1_3', sql.NVarChar(50), contractor_1_3)
      .input('score_2_1', sql.NVarChar(50), score_2_1)
      .input('seller_2_1', sql.NVarChar(50), seller_2_1)
      .input('contractor_2_1', sql.NVarChar(50), contractor_2_1)
      .input('score_2_2', sql.NVarChar(50), score_2_2)
      .input('seller_2_2', sql.NVarChar(50), seller_2_2)
      .input('contractor_2_2', sql.NVarChar(50), contractor_2_2)
      .input('score_2_3', sql.NVarChar(50), score_2_3)
      .input('seller_2_3', sql.NVarChar(50), seller_2_3)
      .input('contractor_2_3', sql.NVarChar(50), contractor_2_3)
      .input('score_3_1', sql.NVarChar(50), score_3_1)
      .input('seller_3_1', sql.NVarChar(50), seller_3_1)
      .input('contractor_3_1', sql.NVarChar(50), contractor_3_1)
      .input('score_3_2', sql.NVarChar(50), score_3_2)
      .input('seller_3_2', sql.NVarChar(50), seller_3_2)
      .input('contractor_3_2', sql.NVarChar(50), contractor_3_2)
      .input('score_3_3', sql.NVarChar(50), score_3_3)
      .input('seller_3_3', sql.NVarChar(50), seller_3_3)
      .input('contractor_3_3', sql.NVarChar(50), contractor_3_3)
      .input('score_4_1', sql.NVarChar(50), score_4_1)
      .input('seller_4_1', sql.NVarChar(50), seller_4_1)
      .input('contractor_4_1', sql.NVarChar(50), contractor_4_1)
      .input('score_4_2', sql.NVarChar(50), score_4_2)
      .input('seller_4_2', sql.NVarChar(50), seller_4_2)
      .input('contractor_4_2', sql.NVarChar(50), contractor_4_2)
      .input('score_4_3', sql.NVarChar(50), score_4_3)
      .input('seller_4_3', sql.NVarChar(50), seller_4_3)
      .input('contractor_4_3', sql.NVarChar(50), contractor_4_3)
      .input('score_5_1', sql.NVarChar(50), score_5_1)
      .input('seller_5_1', sql.NVarChar(50), seller_5_1)
      .input('contractor_5_1', sql.NVarChar(50), contractor_5_1)
      .input('score_5_2', sql.NVarChar(50), score_5_2)
      .input('seller_5_2', sql.NVarChar(50), seller_5_2)
      .input('contractor_5_2', sql.NVarChar(50), contractor_5_2)
      .input('score_6_1', sql.NVarChar(50), score_6_1)
      .input('score_6_2', sql.NVarChar(50), score_6_2)
      .input('score_6_3', sql.NVarChar(50), score_6_3)
      .input('score_7_1', sql.NVarChar(50), score_7_1)
      .input('score_7_2', sql.NVarChar(50), score_7_2)
      .input('score_7_3', sql.NVarChar(50), score_7_3)
      .input('score_8_1', sql.NVarChar(50), score_8_1)
      .input('score_8_2', sql.NVarChar(50), score_8_2)
      .input('score_8_3', sql.NVarChar(50), score_8_3)
      .input('assessor', sql.NVarChar(50), assessor)
      .input('date_evaluate', sql.DateTime, date_evaluate)
      .input('assessment_summary', sql.NVarChar(25), assessment_summary)
      .input('comment1', sql.NVarChar(50), comment1)
      .input('comment1_date', sql.DateTime, comment1_date)
      .input('comment2', sql.NVarChar(50), comment2)
      .input('comment2_date', sql.DateTime, comment2_date)
      .input('comment3', sql.NVarChar(50), comment3)
      .input('comment3_date', sql.DateTime, comment3_date)
      .input('desc_1', sql.NVarChar(10), desc_1)
      .input('desc_2', sql.NVarChar(10), desc_2)
      .input('desc_3', sql.NVarChar(10), desc_3)
      .input('desc_4', sql.NVarChar(10), desc_4)
      .input('desc_5', sql.NVarChar(10), desc_5)
      .input('desc_6', sql.NVarChar(10), desc_6)
      .input('desc_7', sql.NVarChar(10), desc_7)
      .input('desc_8', sql.NVarChar(10), desc_8)
      .output('message', sql.NVarChar(50))
      .execute('UpdateVendorRegisterEvaluate', function(err, returnValue) {
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
        message = returnValue.output.message;
        res.status(200).json({
          success: true,
          message: message
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
// app.post('/vendorRegisterProducts', (req, res) => {
//   const {register_id, type, description, brand} = req.body;
//   const values = [register_id, type, description, brand];
//   let  pool =  sql.connect(config, err => {
//     if (err) {
//       console.log(err);
//       return res.status(500).send('Error connecting to database');
//     }
//   });
//   try {
//     let message = "";
//     pool.request()
//       .input('register_id', sql.Int, register_id)
//       .input('type', sql.NVarChar(255), type)
//       .input('description', sql.NVarChar(MAX), description)
//       .input('brand', sql.NVarChar(255), brand)
//       .output('message', sql.NVarChar(50))
//       .execute('AddVendorRegisterProducts', function(err, returnValue) {
//         if (err){
//           const errorResult = {
//             code: 'E0001',
//             message: err
//           };
//           res.status(500).json({
//             success: false,
//             error: errorResult
//           });
//         }
//         console.log(returnValue);
//         message = returnValue.output.message;
//         res.status(200).json({
//           success: true,
//           message: message,
//           data: values
//         });
//     });
//   } catch (error) {
//       const errorResult = {
//         code: 'E0001',
//         message: 'An error occurred while retrieving data'
//       };
//       res.status(500).json({
//         success: false,
//         error: errorResult
//       });
//   }
// });
app.post('/checkEmailRegister', (req, res) =>{
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const email = req.body.email;
    const query = "SELECT * FROM dbo.db_vendor_register WHERE email = '" +email+ "' AND del = 0";
    sql.query(query, (err, result) => {
      console.log(result);
      if (err) {
        console.log(err);
        return res.status(500).send('Error executing query');
      }

      if (result.recordset.length === 0) {
        return res.status(200).json({
          success: false,
          message: 'Email นี้มีอยู่ในระบบแล้ว',
        });
      }else{
        return res.status(200).json({
          success: true,
          message: 'Email success',
        });
      }
    });
  });
});


// ****************************************************************************************************************** vendor form get service
app.get('/vendorServiceCat', (req, res) =>{
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const query = "SELECT * FROM dbo.db_vendor_service_cat WHERE del = 0";
    sql.query(query, (err, result) => {
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
// ****************************************************************************************************************** End vendor form get service



// ****************************************************************************************************************** vendor form get goods
app.get('/vendorGoods', (req, res) =>{
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const query = "SELECT business_section FROM dbo.db_structure_avl GROUP BY business_section";
    sql.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error executing query');
      }
      res.send(result.recordset);
    });
  });
});
app.post('/vendorGoodsPackage', (req, res) =>{
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const business_section = req.body.business_section;
    const query = "SELECT package FROM dbo.db_structure_avl WHERE business_section = '"+ business_section +"' GROUP BY package";
    sql.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error executing query');
      }
      res.send(result.recordset);
    });
  });
});
app.post('/vendorGoodsGroup', (req, res) =>{
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const business_section = req.body.business_section;
    const package = req.body.package;
    const query = "SELECT equipment_group FROM dbo.db_structure_avl WHERE business_section = '"+ business_section +"' AND package = '"+ package +"' GROUP BY equipment_group";
    sql.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error executing query');
      }
      res.send(result.recordset);
    });
  });
});
app.post('/vendorGoodsList', (req, res) =>{
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const business_section = req.body.business_section;
    const package = req.body.package;
    const equipment_group = req.body.equipment_group;
    const query = "SELECT equipment_list FROM dbo.db_structure_avl WHERE package = '"+ package +"' AND business_section = '"+ business_section +"' AND equipment_group = '"+ equipment_group +"' GROUP BY equipment_list";
    sql.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error executing query');
      }
      res.send(result.recordset);
    });
  });
});
app.post('/vendorGoodsBrand', (req, res) =>{
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const business_section = req.body.business_section;
    const package = req.body.package;
    const equipment_group = req.body.equipment_group;
    const equipment_list = req.body.equipment_list;
    const query = "SELECT * FROM dbo.db_structure_avl WHERE package = '"+ package +"' AND business_section = '"+ business_section +"' AND equipment_group = '"+ equipment_group +"' AND equipment_list = '"+ equipment_list +"'";
    sql.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error executing query');
      }
      res.send(result.recordset);
    });
  });
});
// ****************************************************************************************************************** End vendor form get goods



// ****************************************************************************************************************** vendor login
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
// ****************************************************************************************************************** End vendor login


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





// ****************************************************************************************************************** upload files
app.get('/images/:filename', (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, 'uploads', filename);
  res.sendFile(imagePath);
});

app.post('/saveImage', (req, res) => {
  const base64Image = req.body.image;
  const fileType = req.body.fileType;
  // console.log(fileType);
  // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
  // const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
  // const base64Data = base64Image.replace(/^data:(image\/\w+|application\/\w+);base64,/, '');
  const base64Data = base64Image.replace(/^data:(image\/\w+|application\/vnd\.openxmlformats-officedocument\.(wordprocessingml\.(document|template)|spreadsheetml\.(sheet|template)|presentationml\.(presentation|template|slideshow|slide))|application\/pdf);base64,/, '');
  
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
  return `file_${timestamp}_${randomNum}`;
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
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'docx';
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.template':
      return 'dotx';
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return 'xlsx';
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.template':
      return 'xltx';
    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      return 'pptx';
    case 'application/vnd.openxmlformats-officedocument.presentationml.template':
      return 'potx';
    case 'application/vnd.openxmlformats-officedocument.presentationml.slideshow':
      return 'ppsx';
    case 'application/vnd.openxmlformats-officedocument.presentationml.slide':
      return 'sldx';
    default:
      return fileType.split('/')[1];
  }
}
// ****************************************************************************************************************** End upload files


// ****************************************************************************************************************** send email
app.post('/sendEmailRegister', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // var transporter = nodemailer.createTransport({
  //   service: 'gmail',
  //   auth: {
  //     user: 'support@fsoftpro.com',
  //     pass: 'Fsps0lution'
  //   }
  // });
  var transporter = nodemailer.createTransport({
    host: '10.1.1.10',
    secure: false,
    port: 25,
    auth: {
        user: '',
        pass: ''
    }
  });
  
  var mailOptions = {
    from: 'BIG Application <appserve@bigth.com>',
    to: email,
    subject: 'big register',
    text: `
        <p>Dear ${email}</p>
        <br>
        <p>Thank you for registering on BIG Vendor Management System</p>
        <p>website. </p>
        <p>You can now login to the website using your email and password below</p>
        <p>in order to submit new vendor registration document.</p>
        <p>Password : ${password}</p>
        <br>
        <p>Best regards, </p>
        <p>BIG Vendor Management System</p>
      `
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
});
app.post('/sendEmailUploadDoc', (req, res) => {
  const email = req.body.email;

  var transporter = nodemailer.createTransport({
    host: '10.1.1.10',
    secure: false,
    port: 25,
    auth: {
        user: '',
        pass: ''
    }
  });
  
  var mailOptions = {
    from: 'BIG Application <appserve@bigth.com>',
    to: email,
    subject: 'big register',
    text: `
        <p>Dear ${email}</p>
        <br>
        <p>Thank you for submitting document on the new vendor registration process.</p>
        <p>We will verify your information and send the link to your email once we </p>
        <p>approved.</p>

        <p>Best regards, </p>
        <p>BIG Vendor Management System</p>
      `
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
});
function sendMails(email,token,cat_id){
  // var transporter = nodemailer.createTransport({
  //   service: 'gmail',
  //   auth: {
  //     user: 'support@fsoftpro.com',
  //     pass: 'Fsps0lution'
  //   }
  // });
  var transporter = nodemailer.createTransport({
    host: '10.1.1.10',
    secure: false,
    port: 25,
    auth: {
        user: '',
        pass: ''
    }
  });
  if(cat_id == 1){
    var mailOptions = {
      from: 'BIG Application <appserve@bigth.com>',
      to: email,
      subject: 'Dear Vendor',
      text: `
        <p>Dear ${email}</p>
        <br>
        <p>Thank you for waiting. We verified your document on the new vendor registration</p>
        <p>process. Please fill out the New Supplier/Contractor Qualification form to</p>
        <p>complete the New Vendor Registration process.</p>
        <p>To complete the form, please click below link :</p>
        <p>link from : http://10.1.1.84:4300/form/form-evaluation/'${token}</p>
        <p>Completed New vendor registraion process</p>
        <p>Best regards, </p>
        <p>BIG Vendor Management System</p>
      `
    };
  }else if(cat_id == 2){
    var mailOptions = {
      from: 'BIG Application <appserve@bigth.com>',
      to: email,
      subject: 'Dear Vendor',
      text: `
        <p>Dear ${email}</p>
        <br>
        <p>Thank you for waiting. We verified your document on the new vendor registration</p>
        <p>process. Please fill out the New Supplier/Contractor Qualification form to</p>
        <p>complete the New Vendor Registration process.</p>
        <p>To complete the form, please click below link :</p>
        <p>link from : http://10.1.1.84:4300/form/form-satisfy/'${token}</p>
        <p>Completed New vendor registraion process</p>
        <p>Best regards, </p>
        <p>BIG Vendor Management System</p>
      `
    };
  }
  
  // transporter.sendMail(mailOptions, function(error, info){
  //   if (error) {
  //     console.log(error);
  //   } else {
  //     console.log('Email sent: ' + info.response);
  //   }
  // });

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      // res.send(error);
      // return error;
    } else {
      // res.send(info);
      // return info.response;
    }
  });
}
// ****************************************************************************************************************** End send email


// Vendor Evaluation
app.get('/vendorEvaluation', (req, res) =>{
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const query = "SELECT a.*,b.genaralCompanyName as genaralCompanyName FROM db_vendor_evaluation a LEFT JOIN db_vendor_register b ON a.company_id = b.id WHERE a.del = 0 ORDER BY a.id DESC";
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
app.get('/vendorEvaluation/:id', (req, res) =>{
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const id = req.params.id;
    const query = "SELECT * FROM db_vendor_evaluation WHERE id = '"+id+"'";
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
// app.delete('/vendorEvaluation/:id', (req, res) =>{
//   sql.connect(config, err => {
//     if (err) {
//       console.log(err);
//       return res.status(500).send('Error connecting to database');
//     }
//     const id = req.params.id;
//     const query = "DELETE FROM db_vendor_evaluation WHERE id = '" + id + "'";
//     sql.query(query, (err, result) => {
//       console.log(result);
//       if (err) {
//         console.log(err);
//         return res.status(500).send('Error executing query');
//       }
//       res.send(result.recordset);
//     });
//   });
// });
app.delete('/vendorEvaluation/:id', (req, res) => {
  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  const id = req.params.id;
  try {
    let message = "";
    pool.request()
    .input('id', sql.Int, id)
    .input('del', sql.Int, 1)
    .output('message', sql.NVarChar(50))
    .execute('UpdateVendorEvaluation', function(err, returnValue) {
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
app.post('/vendorEvaluation', (req, res) => {
  const { company_id,vendor_code,group_score,group_users,group_users_other,purchase_of_year,purchase_order_of_year,question2_1,question2_1_desc,score_2_1,desc_2_1,question2_2,question2_2_desc,score_2_2,desc_2_2,score_2_3,desc_2_3,score_2_4,desc_2_4,score_2_5,desc_2_5,score_2_6,score_2_7,score_2_8,desc_2_6,total_score_2,po_number,score_3_1,score_3_2,score_3_3,comment,return_order,user_name,user_name_date,purchasing_officer,purchasing_officer_date,agree_to_proceed,agree_to_proceed_date,assessor,token_detail_id } = req.body;
  const values = [ company_id,vendor_code,group_score,group_users,group_users_other,purchase_of_year,purchase_order_of_year,question2_1,question2_1_desc,score_2_1,desc_2_1,question2_2,question2_2_desc,score_2_2,desc_2_2,score_2_3,desc_2_3,score_2_4,desc_2_4,score_2_5,desc_2_5,score_2_6,score_2_7,score_2_8,desc_2_6,total_score_2,po_number,score_3_1,score_3_2,score_3_3,comment,return_order,user_name,user_name_date,purchasing_officer,purchasing_officer_date,agree_to_proceed,agree_to_proceed_date,assessor,token_detail_id ];

  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
    .input('company_id', sql.Int, company_id)
    .input('vendor_code', sql.NVarChar(20), vendor_code)
    .input('group_score', sql.Int, group_score)
    .input('group_users', sql.Int, group_users)
    .input('group_users_other', sql.NVarChar(100), group_users_other)
    .input('purchase_of_year', sql.NVarChar(20), purchase_of_year)
    .input('purchase_order_of_year', sql.NVarChar(20), purchase_order_of_year)
    .input('question2_1', sql.Int, question2_1)
    .input('question2_1_desc', sql.NVarChar(50), question2_1_desc)
    .input('score_2_1', sql.Int, score_2_1)
    .input('desc_2_1', sql.NVarChar(50), desc_2_1)
    .input('question2_2', sql.Int, question2_2)
    .input('question2_2_desc', sql.NVarChar(50), question2_2_desc)
    .input('score_2_2', sql.Int, score_2_2)
    .input('desc_2_2', sql.NVarChar(50), desc_2_2)
    .input('score_2_3', sql.Int, score_2_3)
    .input('desc_2_3', sql.NVarChar(50), desc_2_3)
    .input('score_2_4', sql.Int, score_2_4)
    .input('desc_2_4', sql.NVarChar(50), desc_2_4)
    .input('score_2_5', sql.Int, score_2_5)
    .input('desc_2_5', sql.NVarChar(50), desc_2_5)
    .input('score_2_6', sql.Int, score_2_6)
    .input('desc_2_6', sql.NVarChar(50), desc_2_6)
    .input('score_2_7', sql.Int, score_2_7)
    .input('score_2_8', sql.Int, score_2_8)
    .input('total_score_2', sql.Float, total_score_2)
    .input('po_number', sql.NVarChar(20), po_number)
    .input('score_3_1', sql.Int, score_3_1)
    .input('score_3_2', sql.Int, score_3_2)
    .input('score_3_3', sql.Int, score_3_3)
    .input('comment', sql.NVarChar(255), comment)
    .input('return_order', sql.Int, return_order)
    .input('user_name', sql.NVarChar(100), user_name)
    .input('user_name_date', sql.DateTime, user_name_date)
    .input('purchasing_officer', sql.NVarChar(100), purchasing_officer)
    .input('purchasing_officer_date', sql.DateTime, purchasing_officer_date)
    .input('agree_to_proceed', sql.NVarChar(100), agree_to_proceed)
    .input('agree_to_proceed_date', sql.DateTime, agree_to_proceed_date)
    .input('assessor', sql.Int, assessor)
    .input('token_detail_id', sql.Int, token_detail_id)
    .output('message', sql.NVarChar(50))
    .execute('AddVendorEvaluation', function(err, returnValue) {
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
app.put('/vendorEvaluation/:id', (req, res) => {
  const { company_id,vendor_code,group_score,group_users,group_users_other,purchase_of_year,purchase_order_of_year,question2_1,question2_1_desc,score_2_1,desc_2_1,question2_2,question2_2_desc,score_2_2,desc_2_2,score_2_3,desc_2_3,score_2_4,desc_2_4,score_2_5,desc_2_5,score_2_6,desc_2_6,total_score_2,po_number,score_3_1,score_3_2,score_3_3,comment,return_order,user_name,user_name_date,purchasing_officer,purchasing_officer_date,agree_to_proceed,agree_to_proceed_date,assessor } = req.body;
  const values = [ company_id,vendor_code,group_score,group_users,group_users_other,purchase_of_year,purchase_order_of_year,question2_1,question2_1_desc,score_2_1,desc_2_1,question2_2,question2_2_desc,score_2_2,desc_2_2,score_2_3,desc_2_3,score_2_4,desc_2_4,score_2_5,desc_2_5,score_2_6,desc_2_6,total_score_2,po_number,score_3_1,score_3_2,score_3_3,comment,return_order,user_name,user_name_date,purchasing_officer,purchasing_officer_date,agree_to_proceed,agree_to_proceed_date,assessor ];

  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  const id = req.params.id;
  try {
    let message = "";
    pool.request()
    .input('id', sql.Int, id)
    .input('company_id', sql.Int, company_id)
    .input('vendor_code', sql.NVarChar(20), vendor_code)
    .input('group_score', sql.Int, group_score)
    .input('group_users', sql.Int, group_users)
    .input('group_users_other', sql.NVarChar(100), group_users_other)
    .input('purchase_of_year', sql.NVarChar(20), purchase_of_year)
    .input('purchase_order_of_year', sql.NVarChar(20), purchase_order_of_year)
    .input('question2_1', sql.Int, question2_1)
    .input('question2_1_desc', sql.NVarChar(50), question2_1_desc)
    .input('score_2_1', sql.Int, score_2_1)
    .input('desc_2_1', sql.NVarChar(50), desc_2_1)
    .input('question2_2', sql.Int, question2_2)
    .input('question2_2_desc', sql.NVarChar(50), question2_2_desc)
    .input('score_2_2', sql.Int, score_2_2)
    .input('desc_2_2', sql.NVarChar(50), desc_2_2)
    .input('score_2_3', sql.Int, score_2_3)
    .input('desc_2_3', sql.NVarChar(50), desc_2_3)
    .input('score_2_4', sql.Int, score_2_4)
    .input('desc_2_4', sql.NVarChar(50), desc_2_4)
    .input('score_2_5', sql.Int, score_2_5)
    .input('desc_2_5', sql.NVarChar(50), desc_2_5)
    .input('score_2_6', sql.Int, score_2_6)
    .input('desc_2_6', sql.NVarChar(50), desc_2_6)
    .input('total_score_2', sql.Float, total_score_2)
    .input('po_number', sql.NVarChar(20), po_number)
    .input('score_3_1', sql.Int, score_3_1)
    .input('score_3_2', sql.Int, score_3_2)
    .input('score_3_3', sql.Int, score_3_3)
    .input('comment', sql.NVarChar(255), comment)
    .input('return_order', sql.Int, return_order)
    .input('user_name', sql.NVarChar(100), user_name)
    .input('user_name_date', sql.DateTime, user_name_date)
    .input('purchasing_officer', sql.NVarChar(100), purchasing_officer)
    .input('purchasing_officer_date', sql.DateTime, purchasing_officer_date)
    .input('agree_to_proceed', sql.NVarChar(100), agree_to_proceed)
    .input('agree_to_proceed_date', sql.DateTime, agree_to_proceed_date)
    .input('assessor', sql.Int, assessor)
    .output('message', sql.NVarChar(50))
    .execute('UpdateVendorEvaluation', function(err, returnValue) {
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
// End Vendor Evaluation


// Vendor Satisfy
app.get('/vendorSatisfy', (req, res) =>{
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const query = "SELECT * FROM db_vendor_satisfy WHERE del = 0 ORDER BY id DESC";
    sql.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error executing query');
      }
      res.send(result.recordset);
    });
  });
});
app.get('/vendorSatisfy/:id', (req, res) =>{
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const id = req.params.id;
    const query = "SELECT * FROM db_vendor_satisfy WHERE id = '" + id + "'";
    sql.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error executing query');
      }
      res.send(result.recordset[0]);
    });
  });
});
app.delete('/vendorSatisfy/:id', (req, res) =>{
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const id = req.params.id;
    const query = "UPDATE db_vendor_satisfy SET del = 1 WHERE id = '" + id + "'";
    sql.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error executing query');
      }
      res.json({ message: 'Update successful' });
    });
  });
});
app.post('/vendorSatisfy', (req, res) => {
  const { po_number,vendor_code,company_name,project_name,user_name,date_assessment_form,year,importance_1_1,satisfaction_1_1,importance_1_2,satisfaction_1_2,importance_1_3,satisfaction_1_3,importance_2_1,satisfaction_2_1,importance_2_2,satisfaction_2_2,importance_3_1,satisfaction_3_1,importance_3_2,satisfaction_3_2,importance_3_3,satisfaction_3_3,importance_4_1,satisfaction_4_1,importance_4_2,satisfaction_4_2,importance_5_1,satisfaction_5_1,importance_5_2,satisfaction_5_2,importance_5_3,satisfaction_5_3,importance_6_1,satisfaction_6_1,importance_6_2,satisfaction_6_2,sum_total,criterion_result,token_detail_id } = req.body;
  const values = [ po_number,vendor_code,company_name,project_name,user_name,date_assessment_form,year,importance_1_1,satisfaction_1_1,importance_1_2,satisfaction_1_2,importance_1_3,satisfaction_1_3,importance_2_1,satisfaction_2_1,importance_2_2,satisfaction_2_2,importance_3_1,satisfaction_3_1,importance_3_2,satisfaction_3_2,importance_3_3,satisfaction_3_3,importance_4_1,satisfaction_4_1,importance_4_2,satisfaction_4_2,importance_5_1,satisfaction_5_1,importance_5_2,satisfaction_5_2,importance_5_3,satisfaction_5_3,importance_6_1,satisfaction_6_1,importance_6_2,satisfaction_6_2,sum_total,criterion_result,token_detail_id ];
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
    .input('po_number', sql.VARCHAR(20), po_number)
    .input('vendor_code', sql.VARCHAR(20), vendor_code)
    .input('company_name', sql.VARCHAR(50), company_name)
    .input('project_name', sql.VARCHAR(100), project_name)
    .input('user_name', sql.VARCHAR(20), user_name)
    .input('date_assessment_form', sql.DateTime, date_assessment_form)
    .input('year', sql.VARCHAR(4), currentYear.toString())
    .input('importance_1_1', sql.VARCHAR(10), importance_1_1)
    .input('satisfaction_1_1', sql.VARCHAR(10), satisfaction_1_1)
    .input('importance_1_2', sql.VARCHAR(10), importance_1_2)
    .input('satisfaction_1_2', sql.VARCHAR(10), satisfaction_1_2)
    .input('importance_1_3', sql.VARCHAR(10), importance_1_3)
    .input('satisfaction_1_3', sql.VARCHAR(10), satisfaction_1_3)
    .input('importance_2_1', sql.VARCHAR(10), importance_2_1)
    .input('satisfaction_2_1', sql.VARCHAR(10), satisfaction_2_1)
    .input('importance_2_2', sql.VARCHAR(10), importance_2_2)
    .input('satisfaction_2_2', sql.VARCHAR(10), satisfaction_2_2)
    .input('importance_3_1', sql.VARCHAR(10), importance_3_1)
    .input('satisfaction_3_1', sql.VARCHAR(10), satisfaction_3_1)
    .input('importance_3_2', sql.VARCHAR(10), importance_3_2)
    .input('satisfaction_3_2', sql.VARCHAR(10), satisfaction_3_2)
    .input('importance_3_3', sql.VARCHAR(10), importance_3_3)
    .input('satisfaction_3_3', sql.VARCHAR(10), satisfaction_3_3)
    .input('importance_4_1', sql.VARCHAR(10), importance_4_1)
    .input('satisfaction_4_1', sql.VARCHAR(10), satisfaction_4_1)
    .input('importance_4_2', sql.VARCHAR(10), importance_4_2)
    .input('satisfaction_4_2', sql.VARCHAR(10), satisfaction_4_2)
    .input('importance_5_1', sql.VARCHAR(10), importance_5_1)
    .input('satisfaction_5_1', sql.VARCHAR(10), satisfaction_5_1)
    .input('importance_5_2', sql.VARCHAR(10), importance_5_2)
    .input('satisfaction_5_2', sql.VARCHAR(10), satisfaction_5_2)
    .input('importance_5_3', sql.VARCHAR(10), importance_5_3)
    .input('satisfaction_5_3', sql.VARCHAR(10), satisfaction_5_3)
    .input('importance_6_1', sql.VARCHAR(10), importance_6_1)
    .input('satisfaction_6_1', sql.VARCHAR(10), satisfaction_6_1)
    .input('importance_6_2', sql.VARCHAR(10), importance_6_2)
    .input('satisfaction_6_2', sql.VARCHAR(10), satisfaction_6_2)
    .input('sum_total', sql.VARCHAR(20), sum_total)
    .input('criterion_result', sql.VARCHAR(10), criterion_result)
    .input('token_detail_id', sql.Int, token_detail_id)
    .output('message', sql.NVarChar(50))
    .execute('AddVendorSatisfy', function(err, returnValue) {
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
      // if (err) {
      //   console.error('Error executing the stored procedure:', err);
      //   return;
      // }
  
      // const message = returnValue.output.message;
      // console.log('Stored procedure executed successfully');
      // console.log('Message:', message);
  
      // // Close the database connection
      // pool.close();

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
app.put('/vendorSatisfy/:id', (req, res) => {
  const { po_number,vendor_code,company_name,project_name,user_name,date_assessment_form,year,importance_1_1,satisfaction_1_1,importance_1_2,satisfaction_1_2,importance_1_3,satisfaction_1_3,importance_2_1,satisfaction_2_1,importance_2_2,satisfaction_2_2,importance_3_1,satisfaction_3_1,importance_3_2,satisfaction_3_2,importance_3_3,satisfaction_3_3,importance_4_1,satisfaction_4_1,importance_4_2,satisfaction_4_2,importance_5_1,satisfaction_5_1,importance_5_2,satisfaction_5_2,importance_5_3,satisfaction_5_3,importance_6_1,satisfaction_6_1,importance_6_2,satisfaction_6_2,sum_total,criterion_result } = req.body;
  const values = [ po_number,vendor_code,company_name,project_name,user_name,date_assessment_form,year,importance_1_1,satisfaction_1_1,importance_1_2,satisfaction_1_2,importance_1_3,satisfaction_1_3,importance_2_1,satisfaction_2_1,importance_2_2,satisfaction_2_2,importance_3_1,satisfaction_3_1,importance_3_2,satisfaction_3_2,importance_3_3,satisfaction_3_3,importance_4_1,satisfaction_4_1,importance_4_2,satisfaction_4_2,importance_5_1,satisfaction_5_1,importance_5_2,satisfaction_5_2,importance_5_3,satisfaction_5_3,importance_6_1,satisfaction_6_1,importance_6_2,satisfaction_6_2,sum_total,criterion_result ];
  const id = req.params.id;
  
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
    .input('po_number', sql.VARCHAR(20), po_number)
    .input('vendor_code', sql.VARCHAR(20), vendor_code)
    .input('company_name', sql.VARCHAR(50), company_name)
    .input('project_name', sql.VARCHAR(100), project_name)
    .input('user_name', sql.VARCHAR(20), user_name)
    .input('date_assessment_form', sql.DateTime, date_assessment_form)
    .input('importance_1_1', sql.VARCHAR(10), importance_1_1)
    .input('satisfaction_1_1', sql.VARCHAR(10), satisfaction_1_1)
    .input('importance_1_2', sql.VARCHAR(10), importance_1_2)
    .input('satisfaction_1_2', sql.VARCHAR(10), satisfaction_1_2)
    .input('importance_1_3', sql.VARCHAR(10), importance_1_3)
    .input('satisfaction_1_3', sql.VARCHAR(10), satisfaction_1_3)
    .input('importance_2_1', sql.VARCHAR(10), importance_2_1)
    .input('satisfaction_2_1', sql.VARCHAR(10), satisfaction_2_1)
    .input('importance_2_2', sql.VARCHAR(10), importance_2_2)
    .input('satisfaction_2_2', sql.VARCHAR(10), satisfaction_2_2)
    .input('importance_3_1', sql.VARCHAR(10), importance_3_1)
    .input('satisfaction_3_1', sql.VARCHAR(10), satisfaction_3_1)
    .input('importance_3_2', sql.VARCHAR(10), importance_3_2)
    .input('satisfaction_3_2', sql.VARCHAR(10), satisfaction_3_2)
    .input('importance_3_3', sql.VARCHAR(10), importance_3_3)
    .input('satisfaction_3_3', sql.VARCHAR(10), satisfaction_3_3)
    .input('importance_4_1', sql.VARCHAR(10), importance_4_1)
    .input('satisfaction_4_1', sql.VARCHAR(10), satisfaction_4_1)
    .input('importance_4_2', sql.VARCHAR(10), importance_4_2)
    .input('satisfaction_4_2', sql.VARCHAR(10), satisfaction_4_2)
    .input('importance_5_1', sql.VARCHAR(10), importance_5_1)
    .input('satisfaction_5_1', sql.VARCHAR(10), satisfaction_5_1)
    .input('importance_5_2', sql.VARCHAR(10), importance_5_2)
    .input('satisfaction_5_2', sql.VARCHAR(10), satisfaction_5_2)
    .input('importance_5_3', sql.VARCHAR(10), importance_5_3)
    .input('satisfaction_5_3', sql.VARCHAR(10), satisfaction_5_3)
    .input('importance_6_1', sql.VARCHAR(10), importance_6_1)
    .input('satisfaction_6_1', sql.VARCHAR(10), satisfaction_6_1)
    .input('importance_6_2', sql.VARCHAR(10), importance_6_2)
    .input('satisfaction_6_2', sql.VARCHAR(10), satisfaction_6_2)
    .input('sum_total', sql.VARCHAR(20), sum_total)
    .input('criterion_result', sql.VARCHAR(10), criterion_result)
    .output('message', sql.NVarChar(50))
    .execute('UpdateVendorSatisfy', function(err, returnValue) {
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
// End Vendor Satisfy


// user
app.get('/user', (req, res) =>{
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const query = `SELECT a.*,b.group_name as group_name 
    FROM db_user a
    LEFT JOIN db_user_group b ON a.group_id = b.group_id
    WHERE a.del = 0`;
    sql.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error executing query');
      }
      res.send(result.recordset);
    });
  });
});
app.get('/user/:id', (req, res) =>{
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const id = req.params.id;
    const query = "SELECT * FROM db_user WHERE id = '"+ id +"'";
    sql.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error executing query');
      }
      res.send(result.recordset[0]);
    });
  });
});
app.post('/user', (req, res) => {
  const { group_id, username, password, name, lastname, phone } = req.body;
  const values = [ group_id, username, password, name, lastname, phone ];

  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
    .input('group_id', sql.Int, group_id)
    .input('username', sql.NVarChar(20), username)
    .input('password', sql.NVarChar(MAX), password)
    .input('name', sql.NVarChar(20), name)
    .input('lastname', sql.NVarChar(20), lastname)
    .input('phone', sql.NVarChar(10), phone)
    .input('del', sql.Int, '0')
    .output('message', sql.NVarChar(50))
    .execute('AddUser', function(err, returnValue) {
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
      const message = returnValue.output.message;

      if (returnValue.returnValue === 1) {
        res.status(200).json({
          success: false,
          message: message,
          data: values
        });
      } else {
        res.status(200).json({
          success: true,
          message: 'Added successfully',
          data: values
        });
      }
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
app.put('/user/:id', (req, res) => {
  const id = req.params.id;
  const { group_id, username, password, name, lastname, phone } = req.body;
  const values = [ group_id, username, password, name, lastname, phone ];
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
    .input('group_id', sql.Int, group_id)
    .input('username', sql.NVarChar(20), username)
    .input('password', sql.NVarChar(MAX), password)
    .input('name', sql.NVarChar(20), name)
    .input('lastname', sql.NVarChar(20), lastname)
    .input('phone', sql.NVarChar(10), phone)
    .output('message', sql.NVarChar(50))
    .execute('UpdateUser', function(err, returnValue) {
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
      if (returnValue.returnValue === 1) {
        res.status(200).json({
          success: false,
          message: message,
          data: values
        });
      } else {
        res.status(200).json({
          success: true,
          message: 'Added successfully',
          data: values
        });
      }
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
app.delete('/user/:id', (req, res) => {
  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  const id = req.params.id;
  try {
    let message = "";
    pool.request()
    .input('id', sql.Int, id)
    .input('del', sql.Int, '1')
    .output('message', sql.NVarChar(50))
    .execute('UpdateUser', function(err, returnValue) {
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
        message: message
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
// end user

// user group
app.get('/userGroup', (req, res) =>{
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const query = "SELECT * FROM db_user_group WHERE del = 0";
    sql.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error executing query');
      }
      res.send(result.recordset);
    });
  });
});
app.get('/userGroup/:id', (req, res) =>{
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const id = req.params.id;
    const query = "SELECT * FROM db_user_group WHERE group_id = '"+ id +"'";
    sql.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error executing query');
      }
      res.send(result.recordset[0]);
    });
  });
});
app.post('/userGroup', (req, res) => {
  const { group_name } = req.body;
  const values = [ group_name ];

  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
    .input('group_name', sql.NVarChar(20), group_name)
    .input('del', sql.Int, '0')
    .output('message', sql.NVarChar(50))
    .execute('AddUserGroup', function(err, returnValue) {
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
app.put('/userGroup/:id', (req, res) => {
  const id = req.params.id;
  const { group_name } = req.body;
  const values = [ group_name ];
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
    .input('group_name', sql.NVarChar(20), group_name)
    .output('message', sql.NVarChar(50))
    .execute('UpdateUserGroup', function(err, returnValue) {
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
app.delete('/userGroup/:id', (req, res) => {
  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  const id = req.params.id;
  try {
    let message = "";
    pool.request()
    .input('id', sql.Int, id)
    .input('del', sql.Int, '1')
    .output('message', sql.NVarChar(50))
    .execute('UpdateUserGroup', function(err, returnValue) {
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
        message: message
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
// end user group


// login
app.post('/login', (req, res) => {
  const { username,password } = req.body;
  const values = [ username,password ];

  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
    .input('username', sql.NVarChar(20), username)
    .input('password', sql.NVarChar(20), password)
    .output('message', sql.NVarChar(50))
    .output('userData', sql.NVarChar(50))
    .execute('login', function(err, returnValue) {
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
      if(returnValue.output.message == 'true'){
        message = returnValue.output.message;
        userData = returnValue.recordset[0];
        res.status(200).json({
          success: true,
          message: message,
          data: userData
        });
      }else{
        res.status(200).json({
          success: false,
          message: message
        });
      }
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
// end login


// ****************************************************************************************************************** report
app.get('/reportsEvaluation', (req, res) =>{
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const query = `
      SELECT a.company_id,b.genaralCompanyName,SUM((a.score_2_1 * 15) + (a.score_2_2 * 15) + (a.score_2_3 * 15) + (a.score_2_4 * 15) + (a.score_2_5 * 10) + (a.score_2_6 * 10)) AS total_score_sum
      FROM db_vendor_evaluation a
      LEFT JOIN db_vendor_register b ON a.company_id = b.id
      GROUP BY a.company_id, b.genaralCompanyName
    `;
    sql.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error executing query');
      }
      res.send(result.recordset);
    });
  });
});
// ****************************************************************************************************************** End report

// ****************************************************************************************************************** news
app.get('/newsWeb', (req, res) => {
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const query = "SELECT TOP(5) * FROM dbo.db_news WHERE del = 0 AND GETDATE() BETWEEN date_post AND date_end ORDER BY id DESC";
    sql.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error executing query');
      }
      res.send(result.recordset);
    });
  });
});
app.get('/news', (req, res) => {
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const query = "SELECT * FROM dbo.db_news WHERE del = 0 ORDER BY id DESC";
    sql.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error executing query');
      }
      res.send(result.recordset);
    });
  });
});
app.get('/news/:id', (req, res) => {
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const id = req.params.id;
    const query = "SELECT * FROM dbo.db_news WHERE id = '"+id+"'";
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
app.post('/news', (req, res) => {
  const { img_cover,subject,date_post,date_end,permission,detail,img } = req.body;
  const values = [ img_cover,subject,date_post,date_end,permission,detail,img ];
  const decodedData = Buffer.from(detail, 'base64').toString('utf-8');
  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
    .input('img_cover', sql.NVarChar(255), img_cover)
    .input('subject', sql.NVarChar(255), subject)
    .input('date_post', sql.DateTime, date_post)
    .input('date_end', sql.DateTime, date_end)
    .input('permission', sql.NVarChar(255), permission)
    .input('detail', sql.NVarChar(MAX), decodedData)
    .input('img', sql.NVarChar(255), img)
    .output('message', sql.NVarChar(50))
    .execute('AddNews', function(err, returnValue) {
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
app.put('/news/:id', (req, res) => {
  const { img_cover,subject,date_post,date_end,permission,detail,img } = req.body;
  const values = [ img_cover,subject,date_post,date_end,permission,detail,img ];
  const decodedData = Buffer.from(detail, 'base64').toString('utf-8');
  const id = req.params.id;
  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
    .input('id', sql.NVarChar(255), id)
    .input('img_cover', sql.NVarChar(255), img_cover)
    .input('subject', sql.NVarChar(255), subject)
    .input('date_post', sql.DateTime, date_post)
    .input('date_end', sql.DateTime, date_end)
    .input('permission', sql.NVarChar(255), permission)
    .input('detail', sql.NVarChar(MAX), decodedData)
    .input('img', sql.NVarChar(255), img)
    .output('message', sql.NVarChar(50))
    .execute('UpdateNews', function(err, returnValue) {
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
app.delete('/news/:id', (req, res) => {
  const id = req.params.id;
  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
    .input('id', sql.NVarChar(255), id)
    .input('del', sql.Int, 1)
    .output('message', sql.NVarChar(50))
    .execute('UpdateNews', function(err, returnValue) {
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
        message: message
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
// ****************************************************************************************************************** End news


// ****************************************************************************************************************** Genarate token
app.get('/checkToken/:token', (req, res) => {
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const token = encodeURIComponent(req.params.token);
    const query = "SELECT * FROM dbo.db_token_detail WHERE token = '"+ token +"'";
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
app.get('/tokenLists/:cat_id', (req, res) => {
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const cat_id = req.params.cat_id;
    // const query = "SELECT a.*,b.id as company_id,b.genaralCompanyName as company_name FROM dbo.db_token_detail a LEFT JOIN db_vendor_register b ON a.vendor_id = b.id WHERE a.del = 0 AND a.cat_id = '"+cat_id+"' ORDER BY id ASC";
    const query = `
      SELECT a.*,b.id as company_id,case when a.vendor_choose = 2 then c.vendor_name else b.genaralCompanyName end as company_name
      FROM dbo.db_token_detail a 
      LEFT JOIN db_vendor_register b ON a.vendor_id = b.id
      LEFT JOIN db_vendor c ON a.vendor_code = c.vendor_code 
      WHERE a.del = 0 AND a.cat_id = '${cat_id}' 
      ORDER BY id DESC
    `;
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
app.post('/genarateToken', (req, res) => {
  const { vendor_id,cat_id,vendor_choose,vendor_code } = req.body;
  const values = [ vendor_id,cat_id,vendor_choose,vendor_code ];
  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
    .input('vendor_id', sql.Int, vendor_id)
    .input('cat_id', sql.Int, cat_id)
    .input('vendor_choose', sql.Int, vendor_choose)
    .input('vendor_code', sql.NVarChar(20), vendor_code)
    .output('message', sql.NVarChar(50))
    .execute('AddToken', function(err, returnValue) {
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
        data: values,
        id: returnValue.returnValue
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
app.post('/genarateTokenDetail', (req, res) => {
  const { vendor_id,email,position,cat_id,status,token_id,vendor_choose,vendor_code } = req.body;
  const values = [ vendor_id,email,position,cat_id,status,token_id,vendor_choose,vendor_code ];

  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 1000);
  const encodedData = Buffer.from(timestamp+'|'+randomNum).toString('base64');
  const uid = encodeURIComponent(encodedData);
  // const encodedData = 'your_encoded_base64_data_here';
  // const decodedBuffer = Buffer.from(encodedData, 'base64');
  // const decodedString = decodedBuffer.toString('utf-8');
  // const [vendor_id, email] = decodedString.split('|');

  // console.log('Vendor ID:', vendor_id);
  // console.log('Email:', email);
  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
    .input('vendor_id', sql.Int, vendor_id)
    .input('cat_id', sql.Int, cat_id)
    .input('position', sql.Int, position)
    .input('status', sql.Int, status)
    .input('token_id', sql.Int, token_id)
    .input('email', sql.NVarChar(255), email)
    .input('token', sql.NVarChar(MAX), uid)
    .input('vendor_choose', sql.Int, vendor_choose)
    .input('vendor_code', sql.NVarChar(20), vendor_code)
    .output('message', sql.NVarChar(50))
    .execute('AddTokenDetail', function(err, returnValue) {
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
      // send mail link form
      sendMails(email,uid,cat_id);
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
app.put('/genarateTokenDetail/:id', (req, res) => {
  const { vendor_id,email,position,cat_id,status,token_id } = req.body;
  const values = [ vendor_id,email,position,cat_id,status,token_id ];
  const id = req.params.id;
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
    .input('vendor_id', sql.Int, vendor_id)
    .input('cat_id', sql.Int, cat_id)
    .input('position', sql.Int, position)
    .input('status', sql.Int, status)
    .input('token_id', sql.Int, token_id)
    .input('email', sql.NVarChar(255), email)
    .output('message', sql.NVarChar(50))
    .execute('UpdateTokenDetail', function(err, returnValue) {
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
app.delete('/genarateTokenDetail/:id', (req, res) => {
  const id = req.params.id;
  let  pool =  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
  });
  try {
    let message = "";
    pool.request()
    .input('id', sql.NVarChar(255), id)
    .input('del', sql.Int, 1)
    .output('message', sql.NVarChar(50))
    .execute('UpdateTokenDetail', function(err, returnValue) {
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
        message: message
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
// ****************************************************************************************************************** End Genarate token


// ****************************************************************************************************************** vendor import not register
app.get('/vendorImportLists', (req, res) => {
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const query = "SELECT * FROM db_vendor where del = 0";
    sql.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error executing query');
      }
      res.send(result.recordset);
    });
  });
});
app.get('/vendorImportLists/:id', (req, res) => {
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const id = req.params.id;
    const query = "SELECT * FROM db_vendor where del = 0 and vendor_code = '"+ id +"'";
    sql.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error executing query');
      }
      res.send(result.recordset[0]);
    });
  });
});
app.get('/vendorImportDetail/:id', (req, res) => {
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const id = req.params.id;
    const query = "SELECT * FROM db_vendor where del = 0 and id = '"+ id +"'";
    sql.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error executing query');
      }
      res.send(result.recordset[0]);
    });
  });
});
app.post('/vendorImportListsProducts', (req, res) => {
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }

    const business_section = req.body.pBusiness;
    const package = req.body.pPackage;
    const equipment_group = req.body.pEquipment_group;
    const equipment_lists = req.body.pEquipment_lists;

    let where = '';
    if (business_section) {
      where += "AND a.business_section = '" + business_section + "' ";
    }
    if (package) {
      where += "AND a.package = '" + package + "' ";
    }
    if (equipment_group) {
      where += "AND a.equipment_group = '" + equipment_group + "' ";
    }
    if (equipment_lists) {
      where += "AND a.equipment_lists = '" + equipment_lists + "' ";
    }
    const query = `
      SELECT *
      FROM dbo.db_vendor_import_product a 
      LEFT JOIN dbo.db_vendor b ON a.vendor_id = b.id 
      WHERE b.del = 0 ${where}
    `;
    sql.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error executing query');
      }
      res.send(result.recordset);
    });
  });
});
app.post('/vendorImportListsService', (req, res) =>{
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const sCat = req.body.sCat;
    const sSubcat = req.body.sSubcat;
    const sService = req.body.sService;


    let where = '';
    if (sCat) {
      where += "AND a.cat_id = '" + sCat + "' ";
    }
    if (sSubcat) {
      where += "AND a.subcat_id = '" + sSubcat + "' ";
    }
    if (sService) {
      where += "AND a.service_id = '" + sService + "' ";
    }
    // const query = `
    //   SELECT a.id as id,c.cat_name as cat_name,d.subcat_name as subcat_name,e.service_name as service_name,b.description as description 
    //   FROM dbo.db_vendor_register a 
    //   LEFT JOIN dbo.db_vendor_register_services b ON a.id = b.register_id 
    //   LEFT JOIN dbo.db_vendor_service_cat c ON b.cat_id = c.cat_id
    //   LEFT JOIN dbo.db_vendor_service_subcat d ON b.subcat_id = d.subcat_id
    //   LEFT JOIN dbo.db_vendor_service e ON b.service_id = e.service_id
    //   WHERE a.del = 0 AND vendor_code is not null AND a.status = 3 ${where} AND (a.generalCompanyTypeBusiness = 2 OR a.generalCompanyTypeBusiness = 3)
    // `;
    const query = `
      SELECT *
      FROM dbo.db_vendor_import_service a 
      LEFT JOIN dbo.db_vendor b ON a.vendor_id = b.id 
      LEFT JOIN dbo.db_vendor_service_cat c ON a.cat_id = c.cat_id
      LEFT JOIN dbo.db_vendor_service_subcat d ON a.subcat_id = d.subcat_id
      LEFT JOIN dbo.db_vendor_service e ON a.service_id = e.service_id
      WHERE b.del = 0 ${where}
    `;
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
// ****************************************************************************************************************** End vendor import not register


// ****************************************************************************************************************** vendor import
// app.post('/vendorImportAdd', (req, res) => {
//   console.log(req.body);
  
// });
app.post('/vendorImportAdd', (req, res) => {
  const data = req.body;
  // console.log(req.body)
  // เชื่อมต่อกับฐานข้อมูล
  sql.connect(config, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('เกิดข้อผิดพลาดในการเชื่อมต่อกับฐานข้อมูล');
      return;
    }

    // ดำเนินการ insert ข้อมูล
    const request = new sql.Request();
    request.input('vendor_code', sql.NVarChar, data.vendor_code);
    request.input('vendor_name', sql.NVarChar, data.vendor_name);
    request.input('type', sql.Int, data.type);
    request.execute('AddVendorImport', function(err, returnValue) {
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
      // for (let i = 0; i < data.row; i++) {
      //   request.input('vendor_id', sql.Int, returnValue);
      //   request.input('business', sql.NVarChar, data.business);
      //   request.input('package', sql.NVarChar, data.package);
      //   request.input('equipment_group', sql.NVarChar, data.equipment_group);
      //   request.input('equipment_lists', sql.NVarChar, data.equipment_lists);
      //   request.input('brand', sql.NVarChar, data.brand);
      //   request.input('description', sql.NVarChar, data.description);
      //   request.execute('AddVendorImportProduct', function(err, returnValue){
      //     if (err) {
      //       console.error(err);
      //       res.status(500).send('เกิดข้อผิดพลาดในการ insert ข้อมูล');
      //     }
      //    console.log('ข้อมูลถูก insert สำเร็จ');
      //   });
      // }
      res.status(200).json({
        success: true,
        message: 'ข้อมูลถูก insert สำเร็จ',
        id:returnValue.returnValue
      });
    });
  });
});
app.put('/vendorImportUpdate/:id', (req, res) => {
  const data = req.body;
  const id = req.params.id;
  // console.log(req.body)
  // เชื่อมต่อกับฐานข้อมูล
  sql.connect(config, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('เกิดข้อผิดพลาดในการเชื่อมต่อกับฐานข้อมูล');
      return;
    }

    // ดำเนินการ insert ข้อมูล
    const request = new sql.Request();
    request.input('id', sql.Int, id);
    request.input('vendor_code', sql.NVarChar, data.vendor_code);
    request.input('vendor_name', sql.NVarChar, data.vendor_name);
    request.input('type', sql.Int, data.type);
    request.execute('UpdateVendorImport', function(err, returnValue) {
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
      res.status(200).json({
        success: true,
        message: 'ข้อมูลถูก Update สำเร็จ',
        id:returnValue.returnValue
      });
    });
  });
});
app.get('/vendorImportProduct/:id', (req, res) => {
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const id = req.params.id;
    const query = "SELECT * FROM db_vendor_import_product where vendor_id = '"+ id +"'";
    sql.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error executing query');
      }
      console.log(result)
      res.send(result.recordset);
    });
  });
});
app.delete('/vendorImportProduct/:id', (req, res) => {
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const id = req.params.id;
    const query = "DELETE FROM db_vendor_import_product where vendor_id = '"+ id +"'";
    sql.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error executing query');
      }
      console.log(result)
      res.send(result.recordset);
    });
  });
});
app.post('/vendorImportProduct/:id', (req, res) => {
  const data = req.body;
  const id = req.params.id;
  // console.log(req.body)
  // เชื่อมต่อกับฐานข้อมูล
  sql.connect(config, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('เกิดข้อผิดพลาดในการเชื่อมต่อกับฐานข้อมูล');
      return;
    }

    // ดำเนินการ insert ข้อมูล
    const request = new sql.Request();
    request.input('vendor_id', sql.Int, id);
    request.input('business_section', sql.NVarChar, data.business);
    request.input('package', sql.NVarChar, data.package);
    request.input('equipment_group', sql.NVarChar, data.equipment_group);
    request.input('equipment_lists', sql.NVarChar, data.equipment_lists);
    request.input('brand', sql.NVarChar, data.brand);
    request.input('description', sql.NVarChar, data.description);
    request.execute('AddVendorImportProduct', function(err, returnValue){
      if (err){
        console.log(err)
        const errorResult = {
          code: 'E0001',
          message: err
        };
        res.status(500).json({
          success: false,
          error: errorResult
        });
      }
      res.status(200).json({
        success: true,
        message: 'ข้อมูลถูก insert สำเร็จ',
      });
    });
  });
});
app.get('/vendorImportService/:id', (req, res) => {
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const id = req.params.id;
    const query = "SELECT * FROM db_vendor_import_service where vendor_id = '"+ id +"'";
    sql.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error executing query');
      }
      console.log(result)
      res.send(result.recordset);
    });
  });
});
app.delete('/vendorImportService/:id', (req, res) => {
  sql.connect(config, err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error connecting to database');
    }
    const id = req.params.id;
    const query = "DELETE FROM db_vendor_import_service where vendor_id = '"+ id +"'";
    sql.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error executing query');
      }
      console.log(result)
      res.send(result.recordset);
    });
  });
});
app.post('/vendorImportService/:id', (req, res) => {
  const data = req.body;
  const id = req.params.id;
  // console.log(req.body)
  // เชื่อมต่อกับฐานข้อมูล
  sql.connect(config, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('เกิดข้อผิดพลาดในการเชื่อมต่อกับฐานข้อมูล');
      return;
    }

    // ดำเนินการ insert ข้อมูล
    const request = new sql.Request();
    request.input('vendor_id', sql.Int, id);
    request.input('cat_id', sql.Int, data.cat_id);
    request.input('subcat_id', sql.Int, data.subcat_id);
    request.input('service_id', sql.Int, data.service_id);
    request.input('description', sql.NVarChar, data.description);
    request.execute('AddVendorImportService', function(err, returnValue){
      if (err){
        console.log(err)
        const errorResult = {
          code: 'E0001',
          message: err
        };
        res.status(500).json({
          success: false,
          error: errorResult
        });
      }
      res.status(200).json({
        success: true,
        message: 'ข้อมูลถูก insert สำเร็จ',
      });
    });
  });
});
app.post('/insert-data', (req, res) => {
  const data = req.body;

  // เชื่อมต่อกับฐานข้อมูล
  sql.connect(config, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('เกิดข้อผิดพลาดในการเชื่อมต่อกับฐานข้อมูล');
      return;
    }

    // สร้างคำสั่ง SQL สำหรับ insert ข้อมูล
    const query = "INSERT INTO YourTable (type, vendor_code, vendor_name, business, package, equipment_group, equipment_lists, brand, description) VALUES (@type, @vendor_code, @vendor_name, @business, @package, @equipment_group, @equipment_lists, @brand, @description)";

    // ดำเนินการ insert ข้อมูล
    const request = new sql.Request();
    request.input('type', sql.VarChar, data.type);
    request.input('vendor_code', sql.VarChar, data.vendor_code);
    request.input('vendor_name', sql.VarChar, data.vendor_name);

    // Loop through the generalGroupProduct data and insert each item
    for (let i = 0; i < generalGroupProduct.length; i++) {
      const product = generalGroupProduct[i];
      request.input('business', sql.VarChar, product.business);
      request.input('package', sql.VarChar, product.package);
      request.input('equipment_group', sql.VarChar, product.equipment_group);
      request.input('equipment_lists', sql.VarChar, product.equipment_lists);
      request.input('brand', sql.VarChar, product.brand);
      request.input('description', sql.VarChar, product.description);
      request.query(query, (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).send('เกิดข้อผิดพลาดในการ insert ข้อมูล');
        }
      });
    }

    res.status(200).send('ข้อมูลถูก insert สำเร็จ');
    sql.close();
  });
});
// ****************************************************************************************************************** End vendor import
app.listen(3502, () => {
  console.log('Server started on port 3502');
});