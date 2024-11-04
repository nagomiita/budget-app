from models.transaction import Category
from sqlalchemy.orm import Session


# 初期カテゴリーデータを挿入する関数
def seed_categories(db: Session):
    initial_categories = [
        {"name": "食費", "type": "expense", "color": "#ff6347", "icon_base64": None},
        {"name": "日用品", "type": "expense", "color": "#4682b4", "icon_base64": None},
        {"name": "住居費", "type": "expense", "color": "#32cd32", "icon_base64": None},
        {"name": "交際費", "type": "expense", "color": "#ffa500", "icon_base64": None},
        {"name": "娯楽", "type": "expense", "color": "#ff6347", "icon_base64": None},
        {"name": "交通費", "type": "expense", "color": "#4682b4", "icon_base64": None},
        {"name": "その他", "type": "expense", "color": "#32cd32", "icon_base64": None},
        {"name": "給与", "type": "income", "color": "#ffa500", "icon_base64": None},
        {"name": "副収入", "type": "income", "color": "#ffa500", "icon_base64": None},
        {"name": "お小遣い", "type": "income", "color": "#ffa500", "icon_base64": None},
    ]

    for category_data in initial_categories:
        # カテゴリが存在しない場合のみ追加
        if (
            not db.query(Category)
            .filter(Category.name == category_data["name"])
            .first()
        ):
            new_category = Category(
                name=category_data["name"],
                color=category_data["color"],
                icon_base64=category_data["icon_base64"],
            )
            db.add(new_category)

    db.commit()
