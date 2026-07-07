import { Outlet, useParams } from 'react-router-dom';
import { PagesSidebar } from './PageEditor';

// Общий каркас раздела «Управление страницами»: мини-панель «Страницы сайта»
// слева остаётся видимой при переходе между редактором блоков и вложенными
// CRUD-экранами (История, Программа, Кандидаты и т.д.) — раньше эти экраны
// рендерились без панели, и она пропадала.
export default function PagesLayout() {
  const { slug } = useParams<{ slug?: string }>();

  return (
    <div className="flex h-full">
      <PagesSidebar activeSlug={slug ?? 'home'} />
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
