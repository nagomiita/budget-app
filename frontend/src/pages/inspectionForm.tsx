import React, { useState, useEffect } from "react";
import { TextField, Button, Box, Typography, Grid } from "@mui/material";
import { format } from "date-fns";

type FormValues = {
  productLot: string;
  inspector: string;
  inspectionDate: string;
  custom_fields: {
    [key: string]: number; // string型のキーを許容
  };
  inspectionFile?: FileList;
};

type CustomFormField = {
  item: keyof FormValues | string;
  type: string;
  display_name: string;
  component_type: "input" | "auto_post" | "calculate" | "file_input";
  formula?: string;
  isInspectionData?: boolean;
};

const customForm: CustomFormField[] = [
  {
    item: "productLot",
    type: "text",
    display_name: "製品ロット",
    component_type: "input",
  },
  {
    item: "inspector",
    type: "text",
    display_name: "検査者",
    component_type: "input",
  },
  {
    item: "inspectionDate",
    type: "date",
    display_name: "検査日",
    component_type: "input",
  },
  {
    item: "custom_field1",
    type: "number",
    display_name: "検査データ1",
    component_type: "auto_post",
    isInspectionData: true,
  },
  {
    item: "custom_field2",
    type: "number",
    display_name: "検査データ2",
    component_type: "auto_post",
    isInspectionData: true,
  },
  {
    item: "custom_field3",
    type: "number",
    display_name: "検査データ3", // 新しいフィールド
    component_type: "auto_post",
    isInspectionData: true,
  },
  {
    item: "formula",
    type: "text",
    display_name: "計算式",
    component_type: "calculate",
    formula: "(custom_field1 + custom_field3) / 2", // 平均を取る計算式
  },
  {
    item: "productLot",
    type: "text",
    display_name: "製品ロット",
    component_type: "input",
  },
  {
    item: "inspector",
    type: "text",
    display_name: "検査者",
    component_type: "input",
  },
  {
    item: "inspectionDate",
    type: "date",
    display_name: "検査日",
    component_type: "input",
  },
  {
    item: "custom_field1",
    type: "number",
    display_name: "検査データ1",
    component_type: "auto_post",
    isInspectionData: true,
  },
  {
    item: "custom_field2",
    type: "number",
    display_name: "検査データ2",
    component_type: "auto_post",
    isInspectionData: true,
  },
  {
    item: "formula",
    type: "text",
    display_name: "計算式",
    component_type: "calculate",
    formula: "custom_field1 * custom_field2",
  },
  // {
  //   item: "inspectionFile",
  //   type: "file",
  //   display_name: "検査データファイル",
  //   component_type: "file_input",
  //   required: true,
  // },
];

const Category: React.FC = () => {
  const [formRows, setFormRows] = useState<FormValues[]>([
    {
      productLot: "",
      inspector: "",
      inspectionDate: format(new Date(), "yyyy-MM-dd"),
      custom_fields: {
        custom_field1: 0,
        custom_field2: 0,
        formula: 0,
      },
    },
  ]);

  const handleRowChange = (
    index: number,
    field: keyof FormValues | string,
    value: any
  ) => {
    setFormRows((prev) => {
      const updatedRows = [...prev];
      if (field.includes("custom_fields.")) {
        const customField = field.split(".")[1];
        updatedRows[index] = {
          ...updatedRows[index],
          custom_fields: {
            ...updatedRows[index].custom_fields,
            [customField]: value,
          },
        };
      } else {
        updatedRows[index] = { ...updatedRows[index], [field]: value };
      }
      return updatedRows;
    });
  };

  const calculateFormula = (index: number) => {
    const customFields = formRows[index].custom_fields;
    const formula = customForm.find(
      (field) => field.item === "formula"
    )?.formula;

    if (formula) {
      // フィールド名に対応する変数を関数の引数として動的に生成
      const fieldKeys = Object.keys(customFields);
      const fieldValues = Object.values(customFields);

      try {
        // 計算式にフィールドの値を代入して評価
        const result = Function(
          ...fieldKeys,
          `return ${formula}`
        )(...fieldValues);
        setFormRows((prev) => {
          const updatedRows = [...prev];
          updatedRows[index] = {
            ...updatedRows[index],
            custom_fields: {
              ...updatedRows[index].custom_fields,
              formula: result, // 計算結果をcustom_fieldsに保存
            },
          };
          return updatedRows;
        });
      } catch (error) {
        console.error("計算式の評価中にエラーが発生しました:", error);
      }
    }
  };

  useEffect(() => {
    formRows.forEach((_, index) => {
      calculateFormula(index);
    });
  }, [formRows]);

  const addFormRow = () => {
    setFormRows((prev) => [
      ...prev,
      {
        productLot: "",
        inspector: "",
        inspectionDate: format(new Date(), "yyyy-MM-dd"),
        custom_fields: {
          custom_field1: 0,
          custom_field2: 0,
          formula: 0, // 初期値を設定
        },
      },
    ]);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log(JSON.stringify(formRows, null, 2));
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ maxWidth: 800, mx: "auto", p: 3 }}
    >
      <Typography variant="h5" component="h1" align="center" sx={{ mb: 3 }}>
        検査フォーム
      </Typography>
      {formRows.map((row, index) => (
        <Grid container spacing={2} key={index}>
          {customForm.map((field) => (
            <Grid item xs={6} key={field.item}>
              {field.component_type === "input" && (
                <TextField
                  label={field.display_name}
                  variant="outlined"
                  fullWidth
                  type={field.type}
                  InputLabelProps={
                    field.type === "date" ? { shrink: true } : {}
                  }
                  value={row[field.item as keyof FormValues] || ""}
                  onChange={(e) =>
                    handleRowChange(index, field.item, e.target.value)
                  }
                />
              )}

              {field.component_type === "auto_post" && (
                <Box display="flex" alignItems="center">
                  <TextField
                    label={field.display_name}
                    variant="outlined"
                    fullWidth
                    type={field.type}
                    value={row.custom_fields[field.item as string] || ""}
                    onChange={(e) =>
                      handleRowChange(
                        index,
                        `custom_fields.${field.item}`,
                        parseFloat(e.target.value)
                      )
                    }
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() =>
                      handleRowChange(index, `custom_fields.${field.item}`, 100)
                    }
                    sx={{ ml: 2 }}
                  >
                    自動取得
                  </Button>
                </Box>
              )}

              {field.component_type === "calculate" && (
                <TextField
                  label={field.display_name}
                  variant="outlined"
                  fullWidth
                  value={
                    row.custom_fields.formula !== null
                      ? row.custom_fields.formula
                      : ""
                  }
                  InputProps={{ readOnly: true }}
                />
              )}

              {field.component_type === "file_input" && (
                <TextField
                  type="file"
                  variant="outlined"
                  fullWidth
                  onChange={(e) =>
                    handleRowChange(
                      index,
                      field.item,
                      (e.target as HTMLInputElement).files
                    )
                  }
                />
              )}
            </Grid>
          ))}
        </Grid>
      ))}
      <Box sx={{ mt: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={addFormRow}
          fullWidth
        >
          行を追加
        </Button>
      </Box>
      <Box sx={{ mt: 3 }}>
        <Button type="submit" variant="contained" color="primary" fullWidth>
          送信
        </Button>
      </Box>
    </Box>
  );
};

export default Category;
