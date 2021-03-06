<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="客户名称" prop="clientId">
        <el-select
          filterable
          v-model="queryParams.clientId"
          placeholder="客户名称"
          clearable
          size="small"
          style="width: 240px">
          <el-option
            v-for="(user,index) in listUserSelect"
            :key="user.id"
            :label="user.name"
            :value="user.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="猫咪编号" prop="sourceId">
        <el-select
          filterable
          v-model="queryParams.sourceId"
          placeholder="猫咪编号"
          clearable
          size="small"
          style="width: 240px">
          <el-option
            v-for="cat in catList"
            :key="cat.id"
            :label="cat.num"
            :value="cat.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="订单类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择订单类型" clearable size="small">
          <el-option v-for="dict in ordersTypeOptions"
                     :key="dict.dictValue"
                     :label="dict.dictLabel"
                     :value="dict.dictValue"/>
        </el-select>
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
          v-hasPermi="['system:orders:add']"
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
          v-hasPermi="['system:orders:edit']"
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
          v-hasPermi="['system:orders:remove']"
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
          v-hasPermi="['system:orders:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="ordersList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="客户姓名" align="center" prop="userName"/>
      <el-table-column label="猫咪编号/物品名称" align="center" prop="sourceName"/>
      <el-table-column label="订单类型" align="center" :formatter="typeFormat" prop="type"/>
      <el-table-column label="售价（单位：元）" align="center" prop="sellingPrice"/>
      <el-table-column label="数量" align="center" prop="quantity"/>
      <el-table-column label="进价（单位：元）" align="center" prop="price"/>
      <el-table-column label="利润（单位：元）" align="center" prop="profit"/>
      <el-table-column label="备注" align="center" prop="remark"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:orders:edit']"
          >修改
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:orders:remove']"
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

    <!-- 添加或修改订单对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="640px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="客户姓名" prop="clientId">
              <el-select v-model="form.clientId" filterable placeholder="请选择">
                <el-option
                  v-for="(user,index) in listUserSelect"
                  :key="user.id"
                  :label="user.name"
                  :value="user.id"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="订单类型">
              <el-select v-model="form.type" placeholder="请选择" @change="typeChange(form.type)">
                <el-option
                  v-for="dict in ordersTypeOptions"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item v-show="ordersTypeOptionsKey=='猫咪'" label="猫咪名称" prop="sourceId">
              <el-select v-model="form.sourceId" filterable placeholder="请选择" @change="numChange(form.sourceId)">
                <el-option
                  v-for="cat in catList"
                  :key="cat.id"
                  :label="cat.num"
                  :value="cat.id"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-show="ordersTypeOptionsKey!='猫咪' " label="药/物名称" prop="sourceId">
              <el-select v-model="form.sourceId" filterable placeholder="请选择" @change="numChange(form.sourceId)" >
                <el-option
                  v-for="orderType in goodsList"
                  :key="orderType.id"
                  :label="orderType.name"
                  :value="orderType.id"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="零售价" prop="sellingPrice">
              <el-input v-model="form.sellingPrice" placeholder="请输入售价" :controls="false" :precision="2"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="数量" prop="quantity">
              <el-input type="number" v-model="form.quantity" placeholder="请输入数量"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="拿货价" prop="price">
              <el-input v-model="form.price" placeholder="请输入价格" :disabled="true"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-form-item label="备注" prop="remark">
            <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"/>
          </el-form-item>
        </el-row>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listCat,
  listGoods,
  listUserSelect,
  listOrders,
  getOrders,
  delOrders,
  addOrders,
  updateOrders,
  exportOrders
} from "@/api/orders/orders";

export default {
  filters: {
    rounding (value) {
      return value.toFixed(2)
    }
  },
  name: "Orders",
  components: {},
  data() {
    return {
      //猫咪列表
      catList: [],
      //猫咪列表查询条件
      catParams: {state: 0, id: null},
      //获取选中物品的类型
      goods: {type: null, id: null},
      //物品的列表
      goodsList: [],
      //客户的集合下拉
      listUserSelect: [],
      //类型的值判断下面的是否需要显示
      ordersTypeOptionsKey: '猫咪',
      //物品类别字典
      ordersTypeOptions: [],
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
      // 订单表格数据
      ordersList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        clientId: null,
        sourceId: null,
        type: null,
        sellingPrice: null,
        quantity: null,
        price: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {},
      ProductActive: "1",

      // 表单校验
      rules: {
        clientId: [
          { required: true, message: "客户姓名不能为空", trigger: "blur" }
        ],
        // nickName: [
        //   { required: true, message: "用户昵称不能为空", trigger: "blur" }
        // ],
        // password: [
        //   { required: true, message: "用户密码不能为空", trigger: "blur" }
        // ],
        // email: [
        //   {
        //     type: "email",
        //     message: "'请输入正确的邮箱地址",
        //     trigger: ["blur", "change"]
        //   }
        // ],
        // phonenumber: [
        //   {
        //     pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
        //     message: "请输入正确的手机号码",
        //     trigger: "blur"
        //   }
        // ]
      }
    };
  },
  created() {
    this.getList();
    this.getUserList()
    this.getCatList();
    this.getDicts("fy_orders_type").then(response => {
      this.ordersTypeOptions = response.data;
    });
  },
  methods: {

    // 字典状态字典翻译
    typeFormat(row, column) {
      return this.selectDictLabel(this.ordersTypeOptions, row.type);
    },
    /** 查询订单列表 */
    getGoodsList() {
      listGoods(this.goods).then(response => {
        this.goodsList = response.data;
      });
    },
    /** 查询猫咪列表 */
    getCatList() {
      listCat(this.catParams).then(response => {
        this.catList = response.data;
      });
    },
    /** 根据猫咪或者物品的改变自动拿到进货的价格 */
    numChange(val) {
      this.catParams.id = val
      this.goods.id = val
      listGoods(this.goods).then(response => {
        if (response.data[0].price != null) {
          this.form.price = response.data[0].price;
        }

        this.goodsList = response.data;
      });
      listCat(this.catParams).then(response => {
        if (response.data[0].primeCost != null) {
          this.form.price = response.data[0].primeCost;
        }

      });
    },
    /** 获取所有用户*/
    getUserList() {
      listUserSelect().then(Response => {
        this.listUserSelect = Response.data;
      });
    },

    /**获取类型下拉的参数信息*/
    typeChange(val) {
      this.form.sourceId = null;
      this.form.price = null;
      this.ordersTypeOptions.forEach(a => {
        if (a.dictValue === val) {
          this.ordersTypeOptionsKey = a.dictLabel
          this.goods.type = a.dictValue
        }
      })
      if (this.ordersTypeOptionsKey != '猫咪') {
        this.getGoodsList();
      }

    },


    // 字典状态字典翻译
    ordersTypeFormat(row, column) {
      return this.selectDictLabel(this.ordersTypeOptions, row.type);
    },
    /** 查询订单列表 */
    getList() {
      this.loading = true;
      listOrders(this.queryParams).then(response => {
        this.ordersList = response.rows;
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
        profit:null,
        userName: null,
        sourceName: null,
        id: null,
        clientId: null,
        sourceId: null,
        type: null,
        sellingPrice: null,
        quantity: null,
        price: null,
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
      this.title = "添加订单";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getOrders(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改订单";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateOrders(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addOrders(this.form).then(response => {
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
      this.$confirm('是否确认删除订单编号为"' + ids + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delOrders(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有订单数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.exportLoading = true;
        return exportOrders(queryParams);
      }).then(response => {
        this.download(response.msg);
        this.exportLoading = false;
      })
    }
  }
};
</script>
