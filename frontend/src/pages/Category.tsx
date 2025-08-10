import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { TextField, Button, Box, Typography, Grid } from "@mui/material";
import { format } from "date-fns";

type FormValues = {
  productLot: string;
  inspector: string;
  inspectionDate: string;
  custom_fields: {
    [key: string]: number; // 動的に増える検査データのための型
  };
  formula: string; // 計算式を格納
  inspectionFile?: FileList; // ファイル入力を追加
};

// フォームフィールドの型定義
type CustomFormField = {
  item: keyof FormValues | string; // 動的に指定できるように修正
  type: string;
  display_name: string;
  component_type: "input" | "auto_post" | "calculate" | "file_input"; // file_inputを追加
  required: boolean;
  multiline?: boolean;
  formula?: string; // 計算式を格納
  isInspectionData?: boolean; // 検査データかどうかのフラグ
};

// customForm に isInspectionData フラグを追加
const customForm: CustomFormField[] = [
  {
    item: "productLot",
    type: "text",
    display_name: "製品ロット",
    component_type: "input",
    required: true,
  },
  {
    item: "inspector",
    type: "text",
    display_name: "検査者",
    component_type: "input",
    required: true,
  },
  {
    item: "inspectionDate",
    type: "date",
    display_name: "検査日",
    component_type: "input",
    required: true,
  },
  {
    item: "inspectionData1",
    type: "number",
    display_name: "検査データ1",
    component_type: "auto_post",
    required: true,
    isInspectionData: true, // フラグを追加
  },
  {
    item: "inspectionData2",
    type: "number",
    display_name: "検査データ2",
    component_type: "auto_post",
    required: true,
    isInspectionData: true, // フラグを追加
  },
  {
    item: "formula",
    type: "text",
    display_name: "計算式",
    component_type: "calculate",
    required: true,
    multiline: true,
    formula: "inspectionData1 * inspectionData2", // 計算式を追加
  },
  {
    item: "inspectionFile",
    type: "file",
    display_name: "検査データファイル",
    component_type: "file_input",
    required: true,
  },
];

const Category: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    setValue, // setValueを追加
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      custom_fields: {},
      inspectionDate: format(new Date(), "yyyy-MM-dd"),
    },
  });

  // inspectionData の動的取得
  const inspectionData = customForm
    .filter((field) => field.isInspectionData) // 検査データフィールドのみを取得
    .map((field) => watch(`custom_fields.${field.item}`)); // 値を watch から取得

  const formula = customForm.find((field) => field.item === "formula")?.formula;

  const [calculatedResult, setCalculatedResult] = useState<number | null>(null);

  const calculateFormula = (formula: string): number | null => {
    // inspectionData から値を取得し、数値に変換
    const [data1, data2] = inspectionData.map((data) => {
      return typeof data === "number" ? data : parseFloat(data) || 0;
    });

    try {
      const result = Function(
        "inspectionData1",
        "inspectionData2",
        `return ${formula}`
      )(data1, data2);
      return typeof result === "number" ? result : null;
    } catch (error) {
      console.error("計算式の評価中にエラーが発生しました:", error);
      return null;
    }
  };

  useEffect(() => {
    if (formula) {
      const result = calculateFormula(formula);
      console.log(result);
      if (result) {
        setCalculatedResult(result);
        setValue(`custom_fields.calculatedResult`, result); // 計算結果を設定
      }
    }
  }, [inspectionData, formula]);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const customFieldData = {
      ...data.custom_fields,
      formula: data.formula,
      calculatedResult: calculatedResult,
    };

    const jsonData = {
      productLot: data.productLot,
      inspector: data.inspector,
      inspectionDate: format(new Date(data.inspectionDate), "yyyy-MM-dd"),
      custom_fields: customFieldData,
      inspectionFile: data.inspectionFile?.[0]?.name,
    };

    console.log(JSON.stringify(jsonData, null, 2));
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ maxWidth: 800, mx: "auto", p: 3 }}
    >
      <Typography variant="h5" component="h1" align="center" sx={{ mb: 3 }}>
        検査フォーム
      </Typography>
      <Grid container spacing={2}>
        {customForm.map((field) => (
          <Grid item xs={6} key={field.item}>
            {field.component_type === "input" && (
              <TextField
                label={field.display_name}
                variant="outlined"
                fullWidth
                type={field.type}
                multiline={field.multiline}
                InputLabelProps={field.type === "date" ? { shrink: true } : {}}
                {...register(field.item as keyof FormValues, {
                  required: field.required
                    ? `${field.display_name}は必須です`
                    : false,
                  valueAsNumber: field.type === "number" ? true : false,
                })}
                error={!!(errors as any)[field.item]}
                helperText={(errors as any)[field.item]?.message}
              />
            )}

            {field.component_type === "auto_post" && (
              <Box display="flex" alignItems="center">
                <TextField
                  label={field.display_name}
                  variant="outlined"
                  fullWidth
                  type={field.type}
                  value={watch(`custom_fields.${field.item}`) || ""} // 値を設定
                  InputLabelProps={{
                    shrink: !!watch(`custom_fields.${field.item}`), // 値が存在する場合に縮小
                  }}
                  {...register(
                    `custom_fields.${field.item}` as keyof FormValues,
                    {
                      required: field.required
                        ? `${field.display_name}は必須です`
                        : false,
                      valueAsNumber: true,
                    }
                  )}
                  error={!!(errors.custom_fields as any)?.[field.item]}
                  helperText={
                    (errors.custom_fields as any)?.[field.item]?.message
                  }
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    // 自動取得の処理をここに追加
                    // 例えば、検査データに固定の値をセットする
                    setValue(`custom_fields.${field.item}`, 100); // 例: 固定値100を設定
                  }}
                  sx={{ ml: 2 }}
                >
                  自動取得
                </Button>
              </Box>
            )}

            {field.component_type === "calculate" && (
              <Box>
                <TextField
                  label={field.display_name}
                  variant="outlined"
                  fullWidth
                  multiline={field.multiline}
                  value={calculatedResult !== null ? calculatedResult : ""} // 計算結果を表示
                  {...register(field.item as keyof FormValues, {
                    required: field.required
                      ? `${field.display_name}は必須です`
                      : false,
                  })}
                  error={!!(errors as any)[field.item]}
                  helperText={(errors as any)[field.item]?.message}
                  InputProps={{
                    readOnly: true, // 入力を防ぐためにreadonlyに設定
                  }}
                />
              </Box>
            )}

            {field.component_type === "file_input" && (
              <TextField
                type="file"
                variant="outlined"
                fullWidth
                {...register(field.item as keyof FormValues, {
                  required: field.required
                    ? `${field.display_name}は必須です`
                    : false,
                })}
                error={!!(errors as any)[field.item]}
                helperText={(errors as any)[field.item]?.message}
              />
            )}
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 3 }}>
        <Button type="submit" variant="contained" color="primary" fullWidth>
          送信
        </Button>
      </Box>
    </Box>
  );
};

export default Category;
