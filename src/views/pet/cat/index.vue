<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">

      <el-form-item label="拿猫日期" prop="haveDate">
        <el-date-picker clearable size="small"
                        v-model="queryParams.haveDate"
                        type="date"
                        value-format="yyyy-MM-dd"
                        placeholder="选择拿猫日期">
        </el-date-picker>
      </el-form-item>

      <el-form-item label="状态" prop="state">
        <el-input
          v-model="queryParams.state"
          placeholder="请输入状态"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:cat:add']"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:cat:edit']"
        >修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:cat:remove']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          :loading="exportLoading"
          @click="handleExport"
          v-hasPermi="['system:cat:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="catList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="类别" align="center" prop="category"/>
      <el-table-column label="品种名称" align="center" prop="breedName"/>
      <el-table-column label="猫咪编号" align="center" prop="num"/>
      <el-table-column label="出生日期" align="center" prop="birthDate" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.birthDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="拿猫日期" align="center" prop="haveDate" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.haveDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="拿猫价格" align="center" prop="primeCost"/>
      <el-table-column label="图片" align="center">
        <template slot-scope="scope">
          <img :src=scope.row.url style="width: 80px;height: 80px">
        </template>

      </el-table-column>
      <el-table-column label="状态" align="center" :formatter="stateFormat" prop="state"/>
      <el-table-column label="备注" align="center" prop="remark"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:cat:edit']"
          >修改
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:cat:remove']"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改猫咪管理对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="640px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="猫咪编号" prop="num">
              <el-input v-model="form.num" :disabled="true" placeholder="系统自动生成编号M********"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="品种名称">
              <el-select v-model="form.breedId" filterable placeholder="请选择">
                <el-option
                  v-for="breed in breeds"
                  :key="breed.id"
                  :label="breed.breedName"
                  :value="breed.id"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="出生日期" prop="birthDate">
              <el-date-picker clearable size="small"
                              v-model="form.birthDate"
                              type="date"
                              value-format="yyyy-MM-dd"
                              placeholder="选择出生日期">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="拿猫日期" prop="haveDate">
              <el-date-picker clearable size="small"
                              v-model="form.haveDate"
                              type="date"
                              value-format="yyyy-MM-dd"
                              placeholder="选择拿猫日期">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-select v-model="form.state" placeholder="请选择">
                <el-option
                  v-for="dict in states"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="拿猫价格" prop="primeCost">
              <el-input type="number" v-model="form.primeCost" placeholder="请输入拿猫价格"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"/>
        </el-form-item>
        <el-form-item label="图片地址" prop="url">
          <el-upload
            ref="upload"
            :limit="1"
            accept=".jpg, .png"
            :action="upload.url"
            :headers="upload.headers"
            :file-list="upload.fileList"
            :on-progress="handleFileUploadProgress"
            :on-success="handleFileSuccess"
            :auto-upload="false">
            <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
            <el-button style="margin-left: 10px;" size="small" type="success" :loading="upload.isUploading"
                       @click="submitUpload">上传到服务器
            </el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {getToken} from "@/utils/auth"
import {listBreedAll, listCat, getCat, delCat, addCat, updateCat, exportCat} from "@/api/pet/cat";


export default {
  name: "Cat",
  components: {},
  data() {

    return {
      // 上传参数
      upload: {
        // 是否禁用上传
        isUploading: false,
        // 设置上传的请求头部
        headers: {Authorization: "Bearer " + getToken()},
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + "/common/upload",
        // 上传的文件列表
        fileList: []
      },
      //状态字典
      states: [],
      //猫咪种类
      breeds: [],
      // 遮罩层
      loading: true,
      // 导出遮罩层
      exportLoading: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 猫咪管理表格数据
      catList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        birthDate: null,
        haveDate: null,
        primeCost: null,
        state: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {}
    };
  },
  //初始话方法
  created() {
    this.getList();
    this.getBreedList();
    this.getDicts("cat_state").then(response => {
      this.states = response.data;
    });
  },
  methods: {


    // 文件提交处理
    submitUpload() {
      this.$refs.upload.submit();
    },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true;
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.upload.isUploading = false;
      this.form.url = response.url;
      this.msgSuccess(response.msg);
    },

    // 字典状态字典翻译
    stateFormat(row, column) {
      return this.selectDictLabel(this.states, row.state);
    },
    // 获取所有的猫的种类
    getBreedList() {
      listBreedAll().then(Response => {
        this.breeds = Response.data;
        console.log(this.breeds);
      });
    },

    /** 查询猫咪管理列表 */
    getList() {
      this.loading = true;
      listCat(this.queryParams).then(response => {
        this.catList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        category: null,
        breedName: null,
        name: null,
        birthDate: null,
        haveDate: null,
        primeCost: null,
        url: null,
        state: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        remark: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加猫咪管理";
      this.upload.fileList = [];
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      debugger
      this.upload.fileList = [{name: this.form.fileName, url: this.form.url}];
      console.log(this.form.url + "url");
      this.reset();
      const id = row.id || this.ids
      getCat(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改猫咪管理";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateCat(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addCat(this.form).then(response => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {

      const ids = row.id || this.ids;
      this.$confirm('是否确认删除猫咪管理编号为"' + ids + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delCat(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有猫咪管理数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.exportLoading = true;
        return exportCat(queryParams);
      }).then(response => {
        this.download(response.msg);
        this.exportLoading = false;
      })
    }
  }
};
</script>
